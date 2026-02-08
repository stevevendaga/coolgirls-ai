SENSITIVE_KEYWORDS = [
    "rape", "abuse", "suicide", "kill myself",
    "drug", "self harm", "ponography", "porn", "fuck", 
    "have sex", "homosexual", "lesbian", "Indian hemp",
    "tramadol", "kill", "kpai"
]

def is_sensitive(text: str) -> bool:
    return any(k in text.lower() for k in SENSITIVE_KEYWORDS)
