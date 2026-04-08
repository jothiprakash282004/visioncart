const products = [
  // Apple Mobiles
  { id: 1, name: "iPhone 15 Pro Max", price: 159900, image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=400&auto=format&fit=crop", category: "Mobiles", group: "Apple Mobiles" },
  { id: 2, name: "iPhone 14 Plus", price: 79999, image: "https://images.unsplash.com/photo-1542203681530-9cd35056bc0a?q=80&w=400&auto=format&fit=crop", category: "Mobiles", group: "Apple Mobiles" },
  
  // Samsung Mobiles
  { id: 3, name: "Samsung Galaxy S24 Ultra", price: 129999, image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=400&auto=format&fit=crop", category: "Mobiles", group: "Samsung Mobiles" },
  { id: 4, name: "Samsung Galaxy Z Fold 5", price: 154999, image: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=400&auto=format&fit=crop", category: "Mobiles", group: "Samsung Mobiles" },
  { id: 20, name: "Samsung Galaxy A54", price: 38999, image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?q=80&w=400&auto=format&fit=crop", category: "Mobiles", group: "Samsung Mobiles" },

  // Realme Mobiles
  { id: 21, name: "Realme 12 Pro+ 5G", price: 29999, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400&auto=format&fit=crop", category: "Mobiles", group: "Realme Mobiles" },
  { id: 22, name: "Realme GT Neo 3", price: 36999, image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=400&auto=format&fit=crop", category: "Mobiles", group: "Realme Mobiles" },

  // Oppo Mobiles
  { id: 23, name: "Oppo Reno 11 Pro", price: 39999, image: "https://images.unsplash.com/photo-1598327105854-c8bf832e01df?q=80&w=400&auto=format&fit=crop", category: "Mobiles", group: "Oppo Mobiles" },
  { id: 24, name: "Oppo Find N3 Flip", price: 94999, image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbc0?q=80&w=400&auto=format&fit=crop", category: "Mobiles", group: "Oppo Mobiles" },

  // Vivo Mobiles
  { id: 25, name: "Vivo X100 Pro", price: 89999, image: "https://images.unsplash.com/photo-1505156868547-9b49f4df4e04?q=80&w=400&auto=format&fit=crop", category: "Mobiles", group: "Vivo Mobiles" },
  { id: 26, name: "Vivo V30 5G", price: 33999, image: "https://images.unsplash.com/photo-1605236453806-6ff368528cc2?q=80&w=400&auto=format&fit=crop", category: "Mobiles", group: "Vivo Mobiles" },

  // Electronics
  { id: 17, name: "Sony 65\" 4K TV", price: 89000, image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=400&auto=format&fit=crop", category: "Electronics", group: "Electronics" },
  { id: 18, name: "MacBook Air M2", price: 104900, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400&auto=format&fit=crop", category: "Electronics", group: "Electronics" },
  { id: 19, name: "AirPods Pro", price: 24900, image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=400&auto=format&fit=crop", category: "Electronics", group: "Electronics" },
  
  // Fashion
  { id: 5, name: "Classic White T-Shirt", price: 999, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400&auto=format&fit=crop", category: "Fashion", group: "Fashion" },
  { id: 6, name: "Denim Jacket", price: 3499, image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=400&auto=format&fit=crop", category: "Fashion", group: "Fashion" },
  { id: 7, name: "Running Shoes", price: 4999, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop", category: "Fashion", group: "Fashion" },
  { id: 8, name: "Leather Watch", price: 2999, image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=400&auto=format&fit=crop", category: "Fashion", group: "Fashion" },

  // Groceries
  { id: 9, name: "Organic Almond Milk", price: 250, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=400&auto=format&fit=crop", category: "Groceries", group: "Groceries" },
  { id: 10, name: "Premium Basmati Rice", price: 850, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=400&auto=format&fit=crop", category: "Groceries", group: "Groceries" },
  { id: 11, name: "Fresh Avocados (1kg)", price: 450, image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=400&auto=format&fit=crop", category: "Groceries", group: "Groceries" },
  { id: 12, name: "Whole Wheat Bread", price: 60, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400&auto=format&fit=crop", category: "Groceries", group: "Groceries" },

  // Home & Kitchen
  { id: 13, name: "Ceramic Coffee Mug", price: 399, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=400&auto=format&fit=crop", category: "Home & Kitchen", group: "Home & Kitchen" },
  { id: 14, name: "Non-Stick Pan Set", price: 2499, image: "https://images.unsplash.com/photo-1588623700085-3b9f87422f28?q=80&w=400&auto=format&fit=crop", category: "Home & Kitchen", group: "Home & Kitchen" },
  { id: 15, name: "Indoor Potted Plant", price: 599, image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=400&auto=format&fit=crop", category: "Home & Kitchen", group: "Home & Kitchen" },
  { id: 16, name: "Cotton Bedsheet", price: 1299, image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=400&auto=format&fit=crop", category: "Home & Kitchen", group: "Home & Kitchen" },
];

export default products;