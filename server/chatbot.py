import os
import sys
import io
import json
import random
import psycopg2
from psycopg2 import sql

# Enable UTF-8 output for Windows compatibility
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

import google.generativeai as genai

# Configure the API key - must be set via GOOGLE_API_KEY environment variable
api_key = os.getenv('GOOGLE_API_KEY')
if not api_key or api_key.startswith('YOUR_'):
    print("❌ ERROR: API key not set!")
    print("Please set your Google API key:")
    print("  1. Get a key from: https://aistudio.google.com/apikey")
    print("  2. Set environment variable: $env:GOOGLE_API_KEY = 'your-key'")
    sys.exit(1)

genai.configure(api_key=api_key)

# Database connection
def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        database="smartcart",
        user="postgres",
        password="123",
        port="5432"
    )

# Search products in database

def normalize_text(text):
    import re
    normalized = re.sub(r"[^\w\s]", " ", text.lower()).strip()
    return re.sub(r"\s+", " ", normalized)


def singularize(word):
    if word.endswith("ies") and len(word) > 4:
        return word[:-3] + "y"
    if word.endswith("es") and len(word) > 3:
        return word[:-2]
    if word.endswith("s") and len(word) > 2:
        return word[:-1]
    return word


def build_search_terms(query):
    import re
    stop_words = {
        'show', 'me', 'i', 'want', 'need', 'find', 'search', 'for', 'a', 'an', 'the',
        'some', 'any', 'please', 'can', 'you', 'help', 'get', 'buy', 'purchase',
        'looking', 'like', 'help', 'give', 'would', 'could', 'showing', 'wanting',
        'looking', 'need', 'need', 'please'
    }
    words = [w for w in re.findall(r"\b\w+\b", normalize_text(query)) if w not in stop_words and len(w) > 2]
    terms = []
    for word in words:
        if word not in terms:
            terms.append(word)
        singular = singularize(word)
        if singular != word and singular not in terms:
            terms.append(singular)
    return terms


def search_products(query, limit=5):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Clean and normalize the query
        query = normalize_text(query)
        if not query:
            return []

        # 1. Try exact phrase match on name or category
        exact_query = """
        SELECT id, name, destription as category, price, image_url
        FROM products
        WHERE name ILIKE %s OR destription ILIKE %s
        LIMIT %s
        """
        cursor.execute(exact_query, (query, query, limit))
        exact_results = cursor.fetchall()
        if exact_results:
            cursor.close()
            conn.close()
            return exact_results

        # 2. Try phrase contains match on name or category
        contains_query = """
        SELECT id, name, destription as category, price, image_url
        FROM products
        WHERE name ILIKE %s OR destription ILIKE %s
        ORDER BY
            CASE
                WHEN name ILIKE %s THEN 1
                WHEN name ILIKE %s THEN 2
                WHEN destription ILIKE %s THEN 3
                ELSE 4
            END ASC,
            LENGTH(name) ASC
        LIMIT %s
        """
        phrase_contains = f"%{query}%"
        cursor.execute(contains_query, (phrase_contains, phrase_contains, f"{query}%", phrase_contains, phrase_contains, limit))
        phrase_results = cursor.fetchall()
        if phrase_results:
            cursor.close()
            conn.close()
            return phrase_results

        # 3. Try cardinals / keyword matches in order of specificity
        terms = build_search_terms(query)
        for term in terms:
            term_contains = f"%{term}%"
            cursor.execute(contains_query, (term_contains, term_contains, f"{term}%", term_contains, term_contains, limit))
            keyword_results = cursor.fetchall()
            if keyword_results:
                cursor.close()
                conn.close()
                return keyword_results

        cursor.close()
        conn.close()
        return []

    except Exception as e:
        print(f"Database error: {e}")
        return []

# Load the chatbot guidelines from chat_bot.txt
def load_chatbot_content():
    try:
        with open('../chat_bot.txt', 'r', encoding='utf-8') as file:
            return file.read()
    except FileNotFoundError:
        return "Chatbot guidelines not found."

# Initialize the model - using Gemini 1.5 Flash (more stable limits)
try:
    model = genai.GenerativeModel('gemini-1.5-flash')
except Exception as e:
    print(f"Note: Trying alternate model name. Error: {e}")
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
    except:
        model = genai.GenerativeModel('gemini-pro')

def get_chatbot_response(user_message, chat_history=None):
    """
    Generate a response using database search and simple logic.

    Args:
        user_message (str): The user's input message
        chat_history (list): Optional list of previous messages

    Returns:
        dict: The chatbot's response object containing reply and optional action
    """
    import re

    def parse_filters(text):
        data = {'budget': None, 'target': None, 'keywords': []}
        normalized = normalize_text(text)

        # Budget extraction
        budget_match = re.search(r'(under|below|less than|up to|max|within)\s*(?:rupees|rs|₹)?\s*(\d{2,6})', normalized)
        if budget_match:
            data['budget'] = {'type': 'max', 'amount': float(budget_match.group(2))}
        else:
            budget_match = re.search(r'(over|above|more than|at least|minimum)\s*(?:rupees|rs|₹)?\s*(\d{2,6})', normalized)
            if budget_match:
                data['budget'] = {'type': 'min', 'amount': float(budget_match.group(2))}
            else:
                between_match = re.search(r'between\s*(?:rupees|rs|₹)?\s*(\d{2,6})\s*(and|to)\s*(?:rupees|rs|₹)?\s*(\d{2,6})', normalized)
                if between_match:
                    data['budget'] = {'type': 'range', 'min': float(between_match.group(1)), 'max': float(between_match.group(3))}
                else:
                    simple_budget = re.search(r'(?:rupees|rs|₹)?\s*(\d{2,6})', normalized)
                    if simple_budget:
                        data['budget'] = {'type': 'max', 'amount': float(simple_budget.group(1))}

        # Target extraction from remaining keywords
        budget_words = ['under', 'below', 'less', 'than', 'up', 'to', 'max', 'within', 'over', 'above', 'more', 'at', 'least', 'minimum', 'between', 'and', 'rupees', 'rs', 'budget', 'price', 'cost']
        if data['budget']:
            if data['budget']['type'] in ['max', 'min']:
                budget_words.append(str(int(data['budget']['amount'])))
            elif data['budget']['type'] == 'range':
                budget_words.extend([str(int(data['budget']['min'])), str(int(data['budget']['max']))])

        cleaned_words = [w for w in re.findall(r'\b\w+\b', normalized) if w.lower() not in budget_words]
        stop_words = {
            'show', 'me', 'i', 'want', 'need', 'find', 'search', 'for', 'a', 'an', 'the',
            'some', 'any', 'please', 'can', 'you', 'help', 'get', 'buy', 'purchase',
            'looking', 'like', 'offer', 'give', 'would', 'could', 'showing', 'wanting',
            'add', 'cart', 'shop', 'else', 'anything', 'item', 'items', 'details', 'show', 'showing'
        }
        words = [w for w in cleaned_words if w.lower() not in stop_words]
        data['keywords'] = words
        if words:
            data['target'] = ' '.join(words[:3])

        return data

    def merge_filters(saved, current):
        combined = saved.copy()
        for key in ['budget', 'target']:
            if current.get(key) and not combined.get(key):
                combined[key] = current[key]
        if current.get('keywords'):
            combined['keywords'] = list(dict.fromkeys((combined.get('keywords') or []) + current['keywords']))
        return combined

    def extract_saved_filters(history):
        filters = {'budget': None, 'target': None, 'keywords': []}
        if not history:
            return filters
        for msg in history:
            if msg.get('sender') == 'user':
                parsed = parse_filters(msg.get('text', ''))
                filters = merge_filters(filters, parsed)
        return filters

    def apply_filters(products, filters):
        results = []
        for prod in products:
            _, name, category, price, image_url = prod
            name_lower = name.lower()
            category_lower = category.lower() if category else ''
            if filters.get('target') and filters['target'].lower() not in name_lower and filters['target'].lower() not in category_lower:
                continue
            if filters.get('budget'):
                budget = filters['budget']
                if budget['type'] == 'max' and price >= budget['amount']:
                    continue
                if budget['type'] == 'min' and price < budget['amount']:
                    continue
                if budget['type'] == 'range' and (price < budget['min'] or price > budget['max']):
                    continue
            results.append(prod)
        return results

    def is_add_intent(text):
        return bool(re.search(r'\b(add|add to cart|buy|buy it|purchase|put in cart|cart it|yes add|yes please add|please add|add this|add that)\b', text))

    def is_buy_intent(text):
        return bool(re.search(r'\b(buy|purchase|want to buy|would like to buy|i\'d like to buy|like to buy|i would like to purchase|want to purchase|would like to purchase)\b', text))

    def is_remove_intent(text):
        return bool(re.search(r'\b(remove|delete|remove from cart|delete from cart|remove cart|remove it|take out|take off|remove that|don\'t want)\b', text))

    def is_checkout_intent(text):
        return bool(re.search(r'\b(checkout|check out|proceed to checkout|go to checkout|buy now|order|place order|confirm order|complete purchase)\b', text))

    def requested_more_options(text):
        return bool(re.search(r'\b(anything else|something else|other options|another item|more products)\b', text))

    cleaned_message = normalize_text(user_message)
    saved_filters = extract_saved_filters(chat_history or [])
    current_filters = parse_filters(user_message)
    filters = merge_filters(saved_filters, current_filters)

    # Check if user wants to proceed to checkout
    if is_checkout_intent(cleaned_message):
        return {
            'reply': 'Great! Let me take you to the checkout page. Review your cart and complete your purchase. 🛍️',
            'action': {
                'type': 'CHECKOUT',
                'payload': {}
            }
        }

    # Check if user wants to remove an item from cart
    if is_remove_intent(cleaned_message):
        # Extract product name/target from the message
        if filters['target']:
            return {
                'reply': f"I've removed items related to \"{filters['target']}\" from your cart. Would you like to continue shopping?",
                'action': {
                    'type': 'REMOVE_FROM_CART',
                    'payload': {'target': filters['target']}
                }
            }
        else:
            return {
                'reply': 'What product would you like to remove from your cart?'
            }

    # If the user wants to start fresh
    if requested_more_options(cleaned_message):
        filters = {'budget': None, 'target': None, 'keywords': []}

    has_search_target = bool(filters['target'])
    has_budget = bool(filters['budget'])
    has_buy_intent = is_buy_intent(cleaned_message)

    products_found = []
    
    if has_search_target:
        # Search products
        products_found = search_products(filters['target'])
        
        # If buy intent exists with budget, apply budget filter
        if has_buy_intent and has_budget:
            products_found = apply_filters(products_found, filters)
        # If buy intent exists without budget, show all products (no budget filtering)
        # If no buy intent, show all products
    else:
        # If no target found yet
        if has_buy_intent:
            # User wants to buy but didn't specify what
            return {
                'reply': (
                    'What product would you like to buy? Tell me the product type. '
                    'For example, mobiles, sofa, lipstick, or perfume.'
                )
            }
        else:
            # Just asking to search
            return {
                'reply': (
                    'What are you searching for today? Tell me the product type. '
                    'For example, sofa, lipstick, mobiles, or perfume.'
                )
            }

    if products_found:
        opener = random.choice([
            'Absolutely — here are your top picks:',
            'Love that choice! I found these shining matches:',
            'You’ll love these handpicked finds:',
            'Great taste! Take a look at these:',
            'Wow, nice pick! These items are ready for you:'
        ])

        if len(products_found) == 1 and is_add_intent(cleaned_message):
            product_id, name, category, price, image_url = products_found[0]
            product_payload = {
                'id': product_id,
                'name': name,
                'category': category,
                'price': float(price) if hasattr(price, 'quantize') else price,
                'image_url': image_url
            }
            return {
                'reply': f"Perfect! I've placed \"{name}\" into your cart.\n\n📦 Would you like to proceed to checkout, continue shopping, or remove items from your cart?",
                'action': {
                    'type': 'ADD_TO_CART',
                    'payload': product_payload,
                    'checkout_available': True
                }
            }

        payload = []
        reply = f"{opener}\n\nCheck out these exciting finds:\n\n"
        for product in products_found[:5]:
            product_id, name, category, price, image_url = product
            reply += f"• {name} - {price} ({category})\n"
            payload.append({
                'id': product_id,
                'name': name,
                'category': category,
                'price': float(price) if hasattr(price, 'quantize') else price,
                'image_url': image_url
            })

        reply += "\n🛒 Use the buttons below to add any product to your cart.\n\n📦 After adding, you can:\n• Go to checkout\n• Remove items from cart\n• Continue shopping"
        return {'reply': reply, 'action': {'type': 'SHOW_PRODUCTS', 'payload': payload, 'checkout_available': True, 'remove_available': True}}

    return {
        'reply': 'Product not in store. Would you like to shop anything else?'
    }

# Example usage / API mode
if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Mode: Accept user input from command line argument (for API calls)
        user_input = " ".join(sys.argv[1:])
        response = get_chatbot_response(user_input)
        # Output ONLY the response as JSON for parsing by Node.js
        print(json.dumps(response, ensure_ascii=False))
    else:
        # Mode: Interactive testing
        user_input = "I want a t-shirt"
        response = get_chatbot_response(user_input)
        print(f"User: {user_input}")
        print(f"Bot: {response}")