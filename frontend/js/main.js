// API Base URL
const API_URL = 'http://localhost:5000/api';

// Sample Products Data (until backend is connected)
const sampleProducts = [
    {
        id: 1,
        name: "MacBook Pro 16-inch",
        category: "laptop",
        brand: "apple",
        specifications: { processor: "M2 Pro", ram: "16GB", storage: "512GB SSD", screen: "16-inch Retina" },
        rentalPrice: { daily: 800, weekly: 5000, monthly: 18000 },
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
        stock: 5
    },
    {
        id: 2,
        name: "Dell XPS 15",
        category: "laptop",
        brand: "dell",
        specifications: { processor: "i7-12700H", ram: "16GB", storage: "1TB SSD", screen: "15.6-inch 4K" },
        rentalPrice: { daily: 600, weekly: 3500, monthly: 12000 },
        image: "https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=400",
        stock: 8
    },
    {
        id: 3,
        name: "HP Pavilion Gaming",
        category: "laptop",
        brand: "hp",
        specifications: { processor: "Ryzen 5", ram: "8GB", storage: "512GB SSD", graphics: "GTX 1650" },
        rentalPrice: { daily: 500, weekly: 3000, monthly: 10000 },
        image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400",
        stock: 10
    },
    {
        id: 4,
        name: "Lenovo ThinkPad X1",
        category: "laptop",
        brand: "lenovo",
        specifications: { processor: "i7-1165G7", ram: "16GB", storage: "512GB SSD", screen: "14-inch FHD" },
        rentalPrice: { daily: 550, weekly: 3200, monthly: 11000 },
        image: "https://images.unsplash.com/photo-1527434065213-849f5e9607ea?w=400",
        stock: 6
    }
];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadNewArrivals();
    setupEventListeners();
    
    // Check if on products page
    if (document.getElementById('productsGrid')) {
        loadProducts();
    }
});

// Load New Arrivals on Homepage
