from datetime import date, timedelta
from .models import Transaction, Budget, Goal, UserProfile
from .services.categorizer import categorize, get_ai_note


def seed_demo_data(db):
    if db.query(UserProfile).first():
        return

    profile = UserProfile(name="Akul", currency="₹", monthly_income_target=50000)
    db.add(profile)

    today = date.today()

    def d(days_ago):
        return today - timedelta(days=days_ago)

    transactions = [
        # --- Current month ---
        ("Salary Credit", 50000, "income", "Income", "", d(2)),
        ("Swiggy Order", 640, "expense", "Food", "Chicken Biryani", d(1)),
        ("Zomato", 420, "expense", "Food", "Pizza", d(3)),
        ("Uber Ride", 280, "expense", "Transport", "Office commute", d(4)),
        ("Netflix", 649, "expense", "Subscriptions", "Monthly plan", d(5)),
        ("Spotify", 119, "expense", "Subscriptions", "Premium", d(5)),
        ("Amazon Shopping", 2499, "expense", "Shopping", "Headphones", d(6)),
        ("Udemy Course", 3000, "expense", "Education", "Python course", d(7)),
        ("Books", 1200, "expense", "Education", "Engineering books", d(8)),
        ("Gym Membership", 1500, "expense", "Health", "Monthly gym", d(9)),
        ("Ola Cab", 350, "expense", "Transport", "Airport drop", d(10)),
        ("Zomato", 560, "expense", "Food", "Dinner order", d(11)),
        ("Rapido", 120, "expense", "Transport", "Short ride", d(12)),
        ("Myntra", 1899, "expense", "Shopping", "T-shirts", d(13)),
        ("PVR Cinema", 800, "expense", "Entertainment", "Movie night", d(14)),
        ("Swiggy Instamart", 980, "expense", "Food", "Groceries", d(15)),
        ("Zerodha SIP", 5000, "expense", "Investments", "Monthly SIP", d(16)),
        ("Electricity Bill", 1400, "expense", "Miscellaneous", "Monthly bill", d(17)),
        ("Dominos Pizza", 520, "expense", "Food", "Weekend treat", d(18)),
        ("Freelance Payment", 8000, "income", "Income", "Design project", d(19)),
        # --- Last month ---
        ("Salary Credit", 50000, "income", "Income", "Monthly salary", d(35)),
        ("Swiggy", 590, "expense", "Food", "Lunch", d(36)),
        ("Zomato", 380, "expense", "Food", "Dinner", d(37)),
        ("Uber", 310, "expense", "Transport", "Commute", d(38)),
        ("Netflix", 649, "expense", "Subscriptions", "Monthly", d(39)),
        ("Spotify", 119, "expense", "Subscriptions", "Premium", d(39)),
        ("Amazon", 3299, "expense", "Shopping", "Shoes", d(40)),
        ("Gym", 1500, "expense", "Health", "Monthly gym", d(41)),
        ("Coursera", 2500, "expense", "Education", "ML course", d(42)),
        ("Rapido", 95, "expense", "Transport", "Quick ride", d(43)),
        ("Myntra", 1299, "expense", "Shopping", "Shirt", d(44)),
        ("BookMyShow", 600, "expense", "Entertainment", "Concert", d(45)),
        ("Swiggy", 720, "expense", "Food", "Party order", d(46)),
        ("Groww SIP", 5000, "expense", "Investments", "SIP", d(47)),
        ("Electricity", 1200, "expense", "Miscellaneous", "Bill", d(48)),
        # --- Two months ago ---
        ("Salary Credit", 50000, "income", "Income", "Monthly salary", d(65)),
        ("Swiggy", 480, "expense", "Food", "Lunch", d(66)),
        ("Uber", 250, "expense", "Transport", "Office cab", d(67)),
        ("Netflix", 649, "expense", "Subscriptions", "Monthly", d(68)),
        ("Flipkart", 4200, "expense", "Shopping", "Keyboard", d(69)),
        ("Gym", 1500, "expense", "Health", "Gym", d(70)),
        ("Zerodha", 5000, "expense", "Investments", "SIP", d(71)),
        ("Medical", 800, "expense", "Health", "Checkup", d(72)),
        ("Stipend", 5000, "income", "Income", "Internship", d(73)),
    ]

    for desc, amount, txn_type, category, notes, txn_date in transactions:
        ai_note = get_ai_note(desc, amount, category)
        t = Transaction(
            date=txn_date,
            description=desc,
            amount=amount,
            type=txn_type,
            category=category,
            notes=notes,
            ai_note=ai_note,
        )
        db.add(t)

    month_str = today.strftime("%Y-%m")
    budgets = [
        ("Food", 8000),
        ("Transport", 2000),
        ("Shopping", 5000),
        ("Subscriptions", 1500),
        ("Entertainment", 2000),
        ("Health", 3000),
        ("Education", 5000),
        ("Investments", 6000),
        ("Miscellaneous", 3000),
    ]
    for category, limit in budgets:
        b = Budget(category=category, monthly_limit=limit, month=month_str)
        db.add(b)

    goals = [
        Goal(
            name="Emergency Fund",
            target_amount=150000,
            current_amount=45000,
            monthly_contribution=5000,
            priority="high",
        ),
        Goal(
            name="New Laptop",
            target_amount=80000,
            current_amount=22000,
            monthly_contribution=8000,
            deadline=date(today.year, today.month + 7 if today.month <= 5 else today.month - 5, 1),
            priority="medium",
        ),
        Goal(
            name="Vacation Trip",
            target_amount=40000,
            current_amount=12000,
            monthly_contribution=4000,
            priority="low",
        ),
        Goal(
            name="Investment Starter",
            target_amount=100000,
            current_amount=30000,
            monthly_contribution=5000,
            priority="high",
        ),
    ]
    for g in goals:
        db.add(g)

    db.commit()
