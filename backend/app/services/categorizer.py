import re

RULES = {
    "Food": [
        "swiggy", "zomato", "dominos", "domino", "pizza", "burger", "mcdonalds", "kfc",
        "subway", "dunkin", "starbucks", "cafe", "restaurant", "biryani", "dhaba",
        "blinkit", "zepto", "instamart", "grofers", "bigbasket", "grocery",
    ],
    "Transport": [
        "uber", "ola", "rapido", "metro", "bus", "auto", "petrol", "fuel",
        "diesel", "parking", "toll", "cab", "taxi", "ola money",
    ],
    "Subscriptions": [
        "netflix", "spotify", "prime", "amazon prime", "hotstar", "disney",
        "youtube premium", "apple music", "zee5", "sonyliv", "jiocinema",
        "gamepass", "playstation", "xbox", "adobe", "notion", "figma",
    ],
    "Shopping": [
        "amazon", "flipkart", "myntra", "ajio", "nykaa", "meesho",
        "snapdeal", "paytm mall", "reliance", "tata cliq", "shopsy",
    ],
    "Education": [
        "udemy", "coursera", "unacademy", "byju", "vedantu", "school",
        "college", "university", "course", "books", "library", "tuition",
        "fees", "exam", "test", "coaching",
    ],
    "Entertainment": [
        "pvr", "inox", "bookmyshow", "concert", "event", "game", "gaming",
        "steam", "epic", "bowling", "amusement", "park", "zoo",
    ],
    "Health": [
        "gym", "fitness", "yoga", "cult", "doctor", "hospital", "clinic",
        "pharmacy", "medicine", "medplus", "apollo", "netmeds", "1mg",
        "health", "dental", "eye", "therapy",
    ],
    "Investments": [
        "zerodha", "groww", "upstox", "kuvera", "coin", "mutual fund",
        "sip", "stocks", "crypto", "gold", "fd", "ppf", "nps", "insurance",
    ],
    "Income": [
        "salary", "stipend", "freelance", "consulting", "payment received",
        "transfer received", "refund", "cashback", "dividend", "interest",
        "rent received", "income",
    ],
    "Rent": [
        "rent", "landlord", "pg", "hostel", "accommodation", "housing",
    ],
}

AI_NOTES = {
    "Food": "food delivery",
    "Transport": "transport expense",
    "Subscriptions": "recurring subscription",
    "Shopping": "shopping expense",
    "Education": "education investment",
    "Entertainment": "entertainment spend",
    "Health": "health expense",
    "Investments": "investment contribution",
    "Income": "income received",
    "Rent": "fixed housing cost",
    "Miscellaneous": "general expense",
}


def categorize(description: str) -> str:
    desc = description.lower()
    for category, keywords in RULES.items():
        for kw in keywords:
            if kw in desc:
                return category
    return "Miscellaneous"


def get_ai_note(description: str, amount: float, category: str) -> str:
    base = AI_NOTES.get(category, "general expense")
    if amount > 5000:
        return f"Large one-time {base}"
    if category == "Subscriptions":
        return "Recurring subscription"
    if category == "Food" and amount < 200:
        return "Small food purchase"
    if category == "Food":
        return "Frequent food delivery" if amount < 800 else "High food spend"
    return base.capitalize()
