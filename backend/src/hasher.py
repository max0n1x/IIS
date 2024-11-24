"""
 * Project: IIS project - Garage sale website
 * @file crypto.py

 * @brief cryptography class for api

 * @author Neonila Mashlai - xmashl00

"""

import bcrypt, hashlib, random, string

PEPPER = "iis_garage_sale_prod_2024"

class Hasher:
    def hash_password(self, password: str) -> str:
        password_with_pepper = (password + PEPPER).encode('utf-8')
        return bcrypt.hashpw(password_with_pepper, bcrypt.gensalt()).decode('utf-8')

    def validate_password(self, hashed_password: str, password: str) -> bool:
        password_with_pepper = (password + PEPPER).encode('utf-8')
        return bcrypt.checkpw(password_with_pepper, hashed_password.encode('utf-8'))
    
    def generate_vkey(self) -> str:
        return hashlib.sha3_512(''.join(random.choices(string.ascii_letters + string.digits, k=256)).encode()).hexdigest()
    
    def generate_code(self) -> str:
        return ''.join(random.choices(string.ascii_letters + string.digits, k=6) )