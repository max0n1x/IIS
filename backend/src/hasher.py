"""
 * Project: ITU project - Garage sale website
 * @file crypto.py

 * @brief cryptography class for api

 * @author Neonila Mashlai - xmashl00

"""

import bcrypt

PEPPER = "iis_garage_sale_prod_2024"

class Hasher:
    def hash_password(self, password: str) -> str:
        password_with_pepper = (password + PEPPER).encode('utf-8')
        return bcrypt.hashpw(password_with_pepper, bcrypt.gensalt()).decode('utf-8')

    def validate_password(self, hashed_password: str, password: str) -> bool:
        password_with_pepper = (password + PEPPER).encode('utf-8')
        return bcrypt.checkpw(password_with_pepper, hashed_password.encode('utf-8'))
    
