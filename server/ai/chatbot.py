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



# Database connection
def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME", "smartcart"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "tiger"),
        port=os.getenv("DB_PORT", "5432")
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

        # 3. Try keyword matches in order of specificity
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


def find_product_by_name(name_query, limit=1):
    """Find a product by approximate name match, returns list of product tuples."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        normalized = normalize_text(name_query)
        query = """
        SELECT id, name, destription as category, price, image_url
        FROM products
        WHERE name ILIKE %s OR destription ILIKE %s
        ORDER BY LENGTH(name) ASC
        LIMIT %s
        """
        cursor.execute(query, (f"%{normalized}%", f"%{normalized}%", limit))
        results = cursor.fetchall()
        if not results:
            # Try individual keyword fallback
            terms = build_search_terms(normalized)
            for term in terms:
                cursor.execute(query, (f"%{term}%", f"%{term}%", limit))
                results = cursor.fetchall()
                if results:
                    break
        cursor.close()
        conn.close()
        return results
    except Exception as e:
        print(f"Database error: {e}")
        return []


def get_order_status(order_id):
    """Look up an order by ID and return its details, or None if not found."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT o.id, o.status, o.total_amount, o.created_at,
                   p.payment_status, p.payment_method, p.transaction_id
            FROM orders o
            LEFT JOIN payments p ON p.order_id = o.id
            WHERE o.id = %s
            LIMIT 1
        """, (order_id,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        return row
    except Exception as e:
        print(f"Database error: {e}", file=sys.stderr)
        return None


# Load the chatbot guidelines from chat_bot.txt
def load_chatbot_content():
    try:
        with open('../../chat_bot.txt', 'r', encoding='utf-8') as file:
            return file.read()
    except FileNotFoundError:
        return "Chatbot guidelines not found."



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

        # Budget extraction — order matters: range first, then directional, then plain
        # Range: "between 500 and 1000" / "500 to 1000" / "rs 500 to rs 1000"
        between_match = re.search(
            r'between\s*(?:rupees?|rs\.?|₹)?\s*(\d{2,6})\s*(?:and|to|-)\s*(?:rupees?|rs\.?|₹)?\s*(\d{2,6})',
            normalized
        ) or re.search(
            r'(?:rupees?|rs\.?|₹)?\s*(\d{2,6})\s*(?:to|-)\s*(?:rupees?|rs\.?|₹)?\s*(\d{2,6})',
            normalized
        )
        if between_match:
            lo, hi = float(between_match.group(1)), float(between_match.group(2))
            data['budget'] = {'type': 'range', 'min': min(lo, hi), 'max': max(lo, hi)}
        else:
            # Max budget: below / under / less than / up to / max / within / cheapest
            max_match = re.search(
                r'(?:cheapest|under|below|less\s*than|up\s*to|max(?:imum)?|within|price\s*(?:under|below|less\s*than)?)'  
                r'\s*(?:rupees?|rs\.?|₹)?\s*(\d{2,6})',
                normalized
            )
            if max_match:
                data['budget'] = {'type': 'max', 'amount': float(max_match.group(1))}
            else:
                # Min budget: above / over / more than / at least / minimum
                min_match = re.search(
                    r'(?:over|above|more\s*than|at\s*least|min(?:imum)?)'  
                    r'\s*(?:rupees?|rs\.?|₹)?\s*(\d{2,6})',
                    normalized
                )
                if min_match:
                    data['budget'] = {'type': 'min', 'amount': float(min_match.group(1))}

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
            'add', 'cart', 'shop', 'else', 'anything', 'item', 'items', 'details', 'show', 'showing',
            # intent / action words that should never be a product target
            'remove', 'delete', 'take', 'out', 'off', 'from', 'that', 'this', 'it',
            'yes', 'no', 'ok', 'okay', 'checkout', 'order', 'place', 'complete', 'proceed',
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
        # NOTE: We intentionally skip the target-name check here.
        # search_products() already guarantees products are relevant to the target.
        # Re-checking the name would falsely reject results where the search term
        # is plural / different form (e.g. "shirts" not in "Man Plaid Shirt").
        results = []
        for prod in products:
            _, name, category, price, image_url = prod
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
        return bool(re.search(r'\b(add|add to cart|put in cart|cart it|yes add|yes please add|please add|add this|add that)\b', text))

    def is_buy_intent(text):
        return bool(re.search(r'\b(buy|purchase|want to buy|would like to buy|i\'d like to buy|like to buy|i would like to purchase|want to purchase|would like to purchase)\b', text))

    def is_remove_intent(text):
        return bool(re.search(r'\b(remove|delete|remove from cart|delete from cart|remove cart|remove it|take out|take off|remove that|don\'t want)\b', text))

    def is_track_order_intent(text):
        return bool(re.search(
            r'\b(track|where|status|check)\s*(my|the|an?)?\s*(order|package|parcel|shipment)\b'
            r'|\border\s*(status|track|tracking|info)\b'
            r'|\b(track\s*order|order\s*track)\b'
            r'|\bwhere\s*is\s*my\s*(order|package|parcel)\b',
            text
        ))

    def awaiting_order_id(history):
        """Return True if the last bot message was asking for an order ID."""
        for msg in reversed(history or []):
            role = msg.get('role') or msg.get('sender', '')
            if role in ('assistant', 'bot'):
                content = (msg.get('content') or msg.get('text') or '').lower()
                return 'order id' in content or 'order number' in content
        return False

    def is_checkout_intent(text):
        return bool(re.search(
            r'\b(checkout|check\s*out|proceed\s*to\s*(checkout|payment|buy|purchase)|'
            r'go\s*to\s*(checkout|cart)|buy\s*now|place\s*(an?\s*)?order|'
            r'confirm\s*order|complete\s*(purchase|order|checkout)|'
            r'want\s*to\s*pay|ready\s*to\s*(pay|buy|checkout)|'
            r'take\s*me\s*to\s*(checkout|cart|payment)|'
            r'i\s*(am|m)\s*ready\s*to|make\s*(a\s*)?payment)\b',
            text
        ))

    def is_view_cart_intent(text):
        return bool(re.search(
            r'\b(view\s*(my\s*)?cart|show\s*(my\s*)?cart|see\s*(my\s*)?cart|'
            r'what\s*(is|s|are)\s*(in\s*)?(my\s*)?cart|my\s*cart|'
            r'cart\s*(items?|contents?|list)|check\s*(my\s*)?cart|'
            r'display\s*(my\s*)?cart|open\s*(my\s*)?cart|'
            r'what\s*did\s*i\s*(add|select|pick)|items?\s*in\s*(my\s*)?cart)\b',
            text
        ))

    def requested_more_options(text):
        return bool(re.search(r'\b(anything else|something else|other options|another item|more products)\b', text))

    def get_store_faq_answer(text):
        if bool(re.search(r'\b(hours|time|timing|open|close|when\s*are\s*you\s*open)\b', text)):
            return "🕒 Our online store is open 24/7! Customer support is available Monday to Friday, 9 AM to 6 PM."
        if bool(re.search(r'\b(location|address|where\s*are\s*you\s*located|where\s*is\s*your\s*store)\b', text)):
            return "📍 We are an online-only store, but our headquarters is located in Chennai, India."
        if bool(re.search(r'\b(contact|support|customer\s*care|email|phone\s*number)\b', text)):
            return "📞 You can reach our customer support at support@fusioncart.com or call us at +91-800-555-0199."
        if bool(re.search(r'\b(return|refund|exchange|money\s*back)\b', text)):
            return "↩️ We offer a 30-day hassle-free return policy. Simply initiate a return from your order history."
        if bool(re.search(r'\b(shipping|delivery|how\s*long|ship|freight)\b', text)):
            return "🚚 Standard delivery takes 3-5 business days. Free shipping on orders over ₹1000!"
        if bool(re.search(r'\b(payment|pay|cod|cash\s*on\s*delivery|credit\s*card|debit)\b', text)):
            return "💳 We accept all major Credit/Debit cards, UPI, Net Banking, and Cash on Delivery (COD)."
        if bool(re.search(r'\b(who\s*are\s*you|about\s*store|fusioncart|smartcart|items in your store)\b', text)):
            return "✨ Welcome to FusionCart! I am your smart shopping assistant, here to help you find the best products easily."
        return None

    cleaned_message = normalize_text(user_message)
    saved_filters = extract_saved_filters(chat_history or [])
    current_filters = parse_filters(user_message)
    filters = merge_filters(saved_filters, current_filters)

    # ── Single-turn: user asks about the store ──────────────────────────────
    faq_answer = get_store_faq_answer(cleaned_message)
    if faq_answer:
        return {'reply': faq_answer}

    # ── Multi-turn: bot previously asked for order ID ──────────────────────
    if awaiting_order_id(chat_history):
        import re as _re
        id_match = _re.search(r'\b(\d{1,10})\b', user_message)
        if id_match:
            oid = int(id_match.group(1))
            row = get_order_status(oid)
            if row:
                order_id, status, total, created_at, pay_status, pay_method, txn_id = row
                date_str = created_at.strftime('%d %b %Y, %I:%M %p') if created_at else 'N/A'
                status_map = {
                    'paid':      '\u2705 Your order has been **placed successfully**! It will be **shipped soon**. 🚚',
                    'placed':    '\u2705 Your order has been **placed successfully**! It will be **shipped soon**. 🚚',
                    'pending':   '\u23f3 Your order is **pending** confirmation. Please wait.',
                    'shipped':   '\U0001f69a Your order is **on the way**! It will arrive soon.',
                    'delivered': '\U0001f4e6 Your order has been **delivered**! Enjoy your purchase.',
                    'cancelled': '\u274c Your order was **cancelled**.',
                }
                status_msg = status_map.get(status.lower(), f'📋 Order status: **{status}**')
                return {
                    'reply': (
                        f"\U0001f4cb **Order #{order_id} Details**\n\n"
                        f"{status_msg}\n\n"
                        f"💰 Total: ₹{float(total):,.2f}\n"
                        f"📅 Placed on: {date_str}\n"
                        f"💳 Payment: {pay_method or 'N/A'} ({pay_status or 'N/A'})\n"
                        + (f"🔖 Transaction ID: {txn_id}" if txn_id else "")
                    )
                }
            else:
                return {
                    'reply': f"\u274c No order found with ID **#{oid}**. Please double-check your order ID and try again."
                }
        else:
            return {
                'reply': 'Please enter a valid numeric order ID. For example: **12** or **345**.'
            }

    # ── Single-turn: user says track order ────────────────────────────────
    if is_track_order_intent(cleaned_message):
        # Check if order ID is already in the message
        import re as _re
        id_match = _re.search(r'\b(\d{1,10})\b', user_message)
        if id_match:
            oid = int(id_match.group(1))
            row = get_order_status(oid)
            if row:
                order_id, status, total, created_at, pay_status, pay_method, txn_id = row
                date_str = created_at.strftime('%d %b %Y, %I:%M %p') if created_at else 'N/A'
                status_map = {
                    'paid':      '\u2705 Your order has been **placed successfully**! It will be **shipped soon**. 🚚',
                    'placed':    '\u2705 Your order has been **placed successfully**! It will be **shipped soon**. 🚚',
                    'pending':   '\u23f3 Your order is **pending** confirmation. Please wait.',
                    'shipped':   '\U0001f69a Your order is **on the way**! It will arrive soon.',
                    'delivered': '\U0001f4e6 Your order has been **delivered**! Enjoy your purchase.',
                    'cancelled': '\u274c Your order was **cancelled**.',
                }
                status_msg = status_map.get(status.lower(), f'📋 Order status: **{status}**')
                return {
                    'reply': (
                        f"\U0001f4cb **Order #{order_id} Details**\n\n"
                        f"{status_msg}\n\n"
                        f"💰 Total: ₹{float(total):,.2f}\n"
                        f"📅 Placed on: {date_str}\n"
                        f"💳 Payment: {pay_method or 'N/A'} ({pay_status or 'N/A'})\n"
                        + (f"🔖 Transaction ID: {txn_id}" if txn_id else "")
                    )
                }
            else:
                return {
                    'reply': f"\u274c No order found with ID **#{oid}**. Please double-check and try again."
                }
        # No ID in message — ask for it
        return {
            'reply': '\U0001f4cb Please enter your **Order ID** and I\'ll look it up right away!\n\nYou can find your Order ID in your confirmation email or order history.'
        }

    # Check if user wants to view their cart
    if is_view_cart_intent(cleaned_message):
        return {
            'reply': '🛒 Here are the items currently in your cart:',
            'action': {'type': 'VIEW_CART', 'payload': {}}
        }

    # Check if user wants to proceed to checkout
    if is_checkout_intent(cleaned_message):
        return {
            'reply': '🛍️ Taking you to checkout! Review your cart and complete your purchase.',
            'action': {
                'type': 'NAVIGATE',
                'payload': {
                    'url': '/checkout',
                    'text': 'Go to Checkout'
                }
            }
        }

    # Check if user wants to remove an item from cart
    if is_remove_intent(cleaned_message):
        if filters['target']:
            # Look up the product in DB so we can pass a real id to the frontend
            found = find_product_by_name(filters['target'])
            if found:
                product_id, name, category, price, image_url = found[0]
                return {
                    'reply': f"✅ Done! I've removed **{name}** from your cart. Would you like to continue shopping?",
                    'action': {
                        'type': 'REMOVE_FROM_CART',
                        'payload': {
                            'id': product_id,
                            'name': name,
                            'image_url': image_url
                        }
                    }
                }
            else:
                return {
                    'reply': f"I couldn't find \"{filters['target']}\" in your cart. Could you check the product name?"
                }
        else:
            return {
                'reply': '🛒 Which product would you like to remove? Please tell me its name.'
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

        # Apply price filter whenever a budget is mentioned (regardless of buy intent)
        if has_budget:
            filtered = apply_filters(products_found, filters)
            # If filtering leaves nothing, return helpful message immediately
            if not filtered and products_found:
                budget = filters['budget']
                if budget['type'] == 'max':
                    price_desc = f"below ₹{int(budget['amount'])}"  
                elif budget['type'] == 'min':
                    price_desc = f"above ₹{int(budget['amount'])}"
                else:
                    price_desc = f"between ₹{int(budget['min'])} and ₹{int(budget['max'])}"
                return {
                    'reply': f"😔 Sorry, no **{filters['target']}** products found {price_desc}. "
                             f"Would you like to see all {filters['target']} products without a price limit?"
                }
            products_found = filtered
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
        # Mode: Accept user input from command line argument (for API calls from Node.js)
        user_input = sys.argv[1]
        # Parse history JSON passed as second argument from server.js
        chat_history = []
        if len(sys.argv) > 2:
            try:
                raw_history = json.loads(sys.argv[2])
                # Normalise format: Chatbot.js sends {role, content}; internal code uses {sender, text}
                for msg in raw_history:
                    role = msg.get('role') or msg.get('sender', '')
                    text = msg.get('content') or msg.get('text') or ''
                    chat_history.append({
                        'sender': 'user' if role == 'user' else 'bot',
                        'role':   role,
                        'text':   text,
                        'content': text
                    })
            except Exception:
                pass
        response = get_chatbot_response(user_input, chat_history)
        # Output ONLY the response as JSON for parsing by Node.js
        print(json.dumps(response, ensure_ascii=False))
    else:
        # Mode: Interactive testing
        user_input = "track my order"
        response = get_chatbot_response(user_input)
        print(f"User: {user_input}")
        print(f"Bot: {response}")