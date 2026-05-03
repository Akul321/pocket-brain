import io
import csv
from datetime import date, datetime
from typing import List, Dict
from .categorizer import categorize, get_ai_note

_DATE_FORMATS = [
    "%Y-%m-%d",   # 2024-01-15
    "%d/%m/%Y",   # 15/01/2024  (Indian/UK)
    "%m/%d/%Y",   # 01/15/2024  (US)
    "%d-%m-%Y",   # 15-01-2024
    "%Y/%m/%d",   # 2024/01/15
    "%d %b %Y",   # 15 Jan 2024
    "%d %B %Y",   # 15 January 2024
    "%b %d, %Y",  # Jan 15, 2024
    "%d/%m/%y",   # 15/01/24
    "%m/%d/%y",   # 01/15/24
]


def _parse_date(raw: str) -> date:
    raw = raw.strip()
    for fmt in _DATE_FORMATS:
        try:
            return datetime.strptime(raw, fmt).date()
        except ValueError:
            continue
    raise ValueError(f"Unrecognised date: {raw!r}")


def parse_csv(content: bytes) -> List[Dict]:
    text = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    records = []
    for row in reader:
        raw_date = row.get("date", "").strip()
        try:
            parsed_date = _parse_date(raw_date)
        except ValueError:
            continue

        description = row.get("description", row.get("merchant", "")).strip()
        amount_raw = row.get("amount", "0").strip().replace(",", "").replace("₹", "")
        try:
            amount = abs(float(amount_raw))
        except ValueError:
            continue

        txn_type = row.get("type", "expense").strip().lower()
        if txn_type not in ("income", "expense"):
            txn_type = "expense"

        category = row.get("category", "").strip()
        if not category:
            category = categorize(description)

        ai_note = get_ai_note(description, amount, category)
        notes = row.get("notes", "").strip()
        payment_method = row.get("payment_method", "Other").strip() or "Other"
        recurring = row.get("recurring", "no").strip().lower()
        if recurring not in ("yes", "no"):
            recurring = "no"

        records.append({
            "date": parsed_date,
            "description": description,
            "amount": amount,
            "type": txn_type,
            "category": category,
            "notes": notes,
            "ai_note": ai_note,
            "payment_method": payment_method,
            "recurring": recurring,
        })
    return records


def export_csv(transactions) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "date", "description", "amount", "type", "category", "notes"])
    for t in transactions:
        writer.writerow([t.id, t.date, t.description, t.amount, t.type, t.category, t.notes])
    return output.getvalue()
