"""
 * Project: IIS project - Garage sale website
 * @file sqlite.py

 * @brief sqlite database class for api

 * @author Neonila Mashlai - xmashl00

"""

import mysql.connector
from mysql.connector import Error
from src.config import DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD
from src.hasher import Hasher
from src.models import Optional
from fastapi import HTTPException
import random


class Database:

    def __init__(self) -> None:
        """ create a database connection to a SQLite database """
        try:

            self.conn = mysql.connector.connect(
                host=DATABASE_HOST,
                port=DATABASE_PORT,
                user=DATABASE_USER,
                password=DATABASE_PASSWORD,
                database='iis_prod'
            )

            if not self.conn:
                print('Cannot connect to the database')
                exit(1)

            self.conn.autocommit = True

            cursor = self.conn.cursor()

            cursor.execute('''CREATE TABLE IF NOT EXISTS users (
                            id INT PRIMARY KEY,
                            username VARCHAR(255) UNIQUE NOT NULL,
                            password_hash TEXT NOT NULL,
                            name TEXT,
                            surname TEXT,
                            email TEXT UNIQUE NOT NULL,
                            phone TEXT,
                            address TEXT,
                            date_of_birth TEXT,
                            role VARCHAR(255) DEFAULT 'user');
            ''')

            cursor.execute('''INSERT INTO users (username, password_hash, role)
                            VALUES (%s, %s, %s)
                            ON DUPLICATE KEY UPDATE 
                                username = VALUES(username), 
                                password_hash = VALUES(password_hash), 
                                role = VALUES(role);
                        ''', ('admin', Hasher().hash_password('admin'), 'admin'))

            cursor.execute('''CREATE TABLE IF NOT EXISTS items (
                            id INT PRIMARY KEY AUTO_INCREMENT,
                            name TEXT NOT NULL,
                            description TEXT,
                            price REAL NOT NULL,
                            size TEXT,
                            category_id TEXT NOT NULL,
                            condition_id TEXT NOT NULL,
                            image_path TEXT NOT NULL,
                            author_id INT NOT NULL,
                            FOREIGN KEY (author_id) REFERENCES users (id));
            ''')

            cursor.execute('''CREATE TABLE IF NOT EXISTS chats (
                            chat_id INT PRIMARY KEY AUTO_INCREMENT,
                            user_from INTEGER NOT NULL,
                            user_to INTEGER NOT NULL,
                            item_id INTEGER NOT NULL,
                            FOREIGN KEY (user_from) REFERENCES users (id),
                            FOREIGN KEY (user_to) REFERENCES users (id),
                            FOREIGN KEY (item_id) REFERENCES items (id));
            ''')

            cursor.execute('''CREATE TABLE IF NOT EXISTS messages (
                            message_id INT PRIMARY KEY AUTO_INCREMENT,
                            chat_id INTEGER NOT NULL,
                            user_from INTEGER NOT NULL,
                            message TEXT NOT NULL,
                            date TEXT NOT NULL,
                            FOREIGN KEY (chat_id) REFERENCES chats (chat_id) ON DELETE CASCADE);
            ''')

            cursor.execute('''CREATE TABLE IF NOT EXISTS validation_keys (
                            user_id INT PRIMARY KEY NOT NULL,
                            vKey TEXT NOT NULL,
                            expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE);
            ''')

            cursor.execute('''CREATE EVENT IF NOT EXISTS autodelete
                            ON SCHEDULE EVERY 10 MINUTE
                            DO
                            DELETE FROM validation_keys WHERE expires_at < NOW();
            ''')

            cursor.execute('''CREATE TABLE IF NOT EXISTS unauthorized_users (
                            id INT PRIMARY KEY AUTO_INCREMENT,
                            time TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
            ''')

            cursor.execute('''CREATE TABLE IF NOT EXISTS errors (
                            id INT PRIMARY KEY AUTO_INCREMENT,
                            time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            message TEXT);
            ''')

            cursor.execute('''CREATE TABLE IF NOT EXISTS reports (
                            id INT PRIMARY KEY AUTO_INCREMENT,
                            time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            message TEXT,
                            item_id INT NOT NULL,
                            FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE);
            ''')

            cursor.execute('''CREATE TABLE IF NOT EXISTS codes (
                            id INT PRIMARY KEY AUTO_INCREMENT,
                            code TEXT NOT NULL,
                            expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            username TEXT NOT NULL,
                            password_hash TEXT NOT NULL);
            ''')

            self.conn.commit()

        except Error as e:
            print(e)
            exit(1)

    def log_error(self, message: str) -> None:
        """ log an error message """
        try:

            cursor = self.conn.cursor()

            cursor.execute('INSERT INTO errors (message) VALUES (%s)', (message,))

            self.conn.commit()

        except Error as e:

            print(e)

    def check_admin(self, user_id : int, vKey : str) -> bool:
        """ check if admin exists """
        if not self.check_validation_key(user_id, vKey):
            self.log_error('Unauthorized')
            raise HTTPException(status_code=401, detail='Unauthorized')
        
        try:
                
            cursor = self.conn.cursor()

            cursor.execute('SELECT role FROM users WHERE id = %s', (user_id,))

            row = cursor.fetchone()

            return True if row[0] == 'admin' else False
        
        except Error as e:
                    
            print(e)
            self.log_error('Cannot check admin')
            return False

    def insert_validation_key(self, user_id: int, vKey: str) -> bool:
        """ insert a new validation key """
        try:

            cursor = self.conn.cursor()

            cursor.execute('DELETE FROM validation_keys WHERE user_id = %s', (user_id,))

            cursor.execute('INSERT INTO validation_keys (user_id, vKey, expires_at) VALUES (%s, %s, DATE_ADD(NOW(), INTERVAL 4 HOUR))', (user_id, vKey))

            self.conn.commit()

            return True
        
        except Error as e:

            print(e)
            self.log_error('Cannot insert validation key')
            return False
        
    def check_validation_key(self, user_id: int, vKey: str) -> bool:
        """ check if the validation key is valid for a user """
        try:

            cursor = self.conn.cursor()

            cursor.execute('SELECT * FROM validation_keys WHERE user_id = %s AND vKey = %s', (user_id, vKey))

            row = cursor.fetchone()

            return True if row else False
        
        except Error as e:

            print(e)
            self.log_error('Cannot check validation key')
            return False
        
    def logout_user(self, user_id: int, vKey: str) -> bool:
        """ remove validation key if user and key are valid """
        try:

            cursor = self.conn.cursor()

            cursor.execute('DELETE FROM validation_keys WHERE user_id = %s AND vKey = %s', (user_id, vKey))

            self.conn.commit()

            return True
        
        except Error as e:

            print(e)
            self.log_error('Cannot logout user')
            return False

        
    def get_user_id_by_validation_key(self, vKey: str) -> int:
        """ get user id by validation key """
        try:

            cursor = self.conn.cursor()

            cursor.execute('SELECT user_id FROM validation_keys WHERE vKey = %s', (vKey,))

            row = cursor.fetchone()

            return row[0] if row else -1
        
        except Error as e:

            print(e)
            self.log_error('Cannot get user id by validation key')
            return -1

    def insert_item(self, **item) -> bool:
        """ insert a new item into the items table """

        if not self.check_validation_key(item['author_id'], item['vKey']):
            self.log_error('Unauthorized')
            raise HTTPException(status_code=401, detail='Unauthorized')
        
        try:

            cursor = self.conn.cursor()

            cursor.execute('''
                INSERT INTO items (name, description, price, size, category_id, condition_id, image_path, author_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ''', (item['name'], item['description'], item['price'], item['size'], item['categoryId'], item['conditionId'], item['image_path'], item['author_id']))

            self.conn.commit()

            return True
        
        except Error as e:

            print(e)
            self.log_error('Cannot insert item')
            return False

    def get_items(self, category_id: str) -> list:
        """ get all items from the items table """
        try:

            cursor = self.conn.cursor()

            cursor.execute('SELECT * FROM items WHERE category_id = %s', (category_id,))

            rows = cursor.fetchall()
            keys = ('id', 'name', 'description', 'price', 'size', 'categoryId', 'conditionId', 'image_path', 'author_id')

            return [{key: value for key, value in zip(keys, row)} for row in rows]

        except Error as e:

            print(e)
            self.log_error('Cannot get items')
            return []

    def get_item(self, item_id: int) -> dict:
        """ get a single item from the items table """
        try:

            cursor = self.conn.cursor()

            cursor.execute('SELECT * FROM items WHERE id = %s', (item_id,))

            row = cursor.fetchone()
            keys = ('id', 'name', 'description', 'price', 'size', 'category_id', 'condition_id', 'image_path', 'author_id')

            return {key: value for key, value in zip(keys, row)} if row else {}
        
        except Error as e:

            print(e)
            self.log_error('Cannot get item')
            return {}

    def delete_item(self, item_id: int, author_id : int, vKey : str) -> bool:
        """ delete a single item from the items table """

        if not self.check_validation_key(author_id, vKey):
            self.log_error('Unauthorized')
            raise HTTPException(status_code=401, detail='Unauthorized')
        
        if not self.get_item(item_id):
            self.log_error('Item not found')
            raise HTTPException(status_code=404, detail='Item not found')

        try:

            cursor = self.conn.cursor()

            cursor.execute('SELECT author_id FROM items WHERE id = %s', (item_id,))
            row = cursor.fetchone()

            if row[0] != author_id:
                self.log_error('Unauthorized')
                return False

            cursor.execute('DELETE FROM items WHERE id = %s', (item_id,))
            self.conn.commit()

            cursor.execute('SELECT chat_id FROM chats WHERE item_id = %s', (item_id,))
            rows = cursor.fetchall()

            for row in rows:
                cursor.execute('DELETE FROM messages WHERE chat_id = %s', (row[0],))

            self.conn.commit()

            cursor.execute('DELETE FROM chats WHERE item_id = %s', (item_id,))
            self.conn.commit()

            return True
        
        except Error as e:

            print(e)
            self.log_error('Cannot delete item')
            return False

    def update_item(self, **item) -> bool:
        """ update a single item from the items table """

        if not self.check_validation_key(item['author_id'], item['vKey']):
            self.log_error('Unauthorized')
            raise HTTPException(status_code=401, detail='Unauthorized')
        
        if not self.get_item(item['item_id']):
            self.log_error('Item not found')
            raise HTTPException(status_code=404, detail='Item not found')
        
        try:

            cursor = self.conn.cursor()

            cursor.execute('SELECT author_id FROM items WHERE id = %s', (item['item_id'],))
            row = cursor.fetchone()

            if row[0] != item['author_id']:
                self.log_error('Unauthorized')
                return False

            cursor.execute('''
                UPDATE items 
                SET name = %s, description = %s, price = %s, size = %s, category_id = %s, condition_id = %s, image_path = %s 
                WHERE id = %s
            ''', (item['name'], item['description'], item['price'], item['size'], item['categoryId'], item['conditionId'], item['image_path'], item['item_id']))

            self.conn.commit()

            return True
        
        except Error as e:

            print(e)
            self.log_error('Cannot update item')
            return False
        
    def register_user(self, **user) -> int:
        """ register a new user if username is not taken """
        try:

            if not user['username'] or not user['password']:
                self.log_error('Empty username or password')
                return -2

            cursor = self.conn.cursor()

            cursor.execute('SELECT * FROM users WHERE email = %s', (user['email'],))
            row = cursor.fetchone()

            if row:
                self.log_error('Email already taken')
                return -1

            hasher = Hasher()
            hash = hasher.hash_password(user['password'])



            cursor.execute('INSERT INTO codes (code, username, password_hash) VALUES (%s, %s, %s)', 
                        (hasher.generate_code(), user['username'], hash))

            self.conn.commit()

            return 0
        
        except Error as e:

            print(e)
            self.log_error('Cannot register user')
            return -3
        
    def login_user(self, **user) -> int:
        """ login a user and return user id if correct username and password are provided, 
        if user does not exist return -1, if password is incorrect return -2, else error return -3 """
        try:

            cursor = self.conn.cursor()

            cursor.execute('SELECT * FROM users WHERE username = %s OR email = %s', (user['username'], user['email']))

            row = cursor.fetchone()

            if not row:
                self.log_error('User not found')
                return -1, ''

            hasher = Hasher()

            if not hasher.validate_password(row[2], user['password']):
                self.log_error('Incorrect username or password')
                return -2, ''
            
            vKey = hasher.generate_vkey()

            self.insert_validation_key(row[0], vKey)

            return row[0], vKey
        
        except Error as e:

            print(e)
            self.log_error('Cannot login user')
            return -3, ''
        
    def get_user_items_bd(self, user_id: int, vKey: str) -> list:
        """ get all items from the items table """

        if not self.check_validation_key(user_id, vKey):
            self.log_error('Unauthorized')
            raise HTTPException(status_code=401, detail='Unauthorized')
        
        try:

            cursor = self.conn.cursor()

            cursor.execute('SELECT * FROM items WHERE author_id = %s', (user_id,))

            rows = cursor.fetchall()

            keys = ('id', 'name', 'description', 'price', 'size', 'categoryId', 'conditionId', 'image_path', 'author_id')

            return [{key: value for key, value in zip(keys, row)} for row in rows]
        
        except Error as e:

            print(e)
            self.log_error('Cannot get user items')
            return None
        
    def get_user(self, user_id : int, vKey : str) -> dict:
        """ get a single user from the users table """

        if not self.check_validation_key(user_id, vKey):
            self.log_error('Unauthorized')
            raise HTTPException(status_code=401, detail='Unauthorized')
        
        if self.check_admin(user_id, vKey):
            return {'role': 'admin'}
        
        try:

            cursor = self.conn.cursor()

            cursor.execute('SELECT id, username, name, surname, email, phone, address, date_of_birth FROM users WHERE id = %s', (user_id,))

            row = cursor.fetchone()

            return {
                'id': row[0],
                'username': row[1],
                'name': row[2],
                'surname': row[3],
                'email': row[4],
                'phone': row[5],
                'address': row[6],
                'date_of_birth': row[7]
            } if row else {}

        except Error as e:

            print(e)
            self.log_error('Cannot get user')
            return {}
        
    def get_user_by_id(self, user_id: int) -> dict:
        """ get a single user from the users table """
        try:

            cursor = self.conn.cursor()

            cursor.execute('SELECT username FROM users WHERE id = %s', (user_id,))

            row = cursor.fetchone()

            return {
                'username': row[0],
            } if row else {}

        except Error as e:

            print(e)
            self.log_error('Cannot get user by id')
            return {} 
        
    def update_user(self, **user) -> bool:
        """ update a single user from the users table """

        if not self.check_validation_key(user['user_id'], user['vKey']):
            self.log_error('Unauthorized')
            raise HTTPException(status_code=401, detail='Unauthorized')
        
        try:

            cursor = self.conn.cursor()

            cursor.execute('UPDATE users SET name = %s, surname = %s, phone = %s, address = %s, date_of_birth = %s WHERE id = %s', 
                        (user['name'], user['surname'], user['phone'], user['address'], user['date_of_birth'], user['user_id']))

            self.conn.commit()

            return True

        except Error as e:

            print(e)
            self.log_error('Cannot update user')
            return False
        
    def delete_user(self, user_id : int, vKey : str) -> bool:
        """ delete a single user from the users table """

        if not self.check_validation_key(user_id, vKey):
            self.log_error('Unauthorized')
            raise HTTPException(status_code=401, detail='Unauthorized')

        try:
                
            cursor = self.conn.cursor()

            cursor.execute('SELECT chat_id FROM chats WHERE user_from = %s OR user_to = %s', (user_id, user_id))
            rows = cursor.fetchall()

            for row in rows:
                cursor.execute('DELETE FROM messages WHERE chat_id = %s', (row[0],))
                self.conn.commit()

            cursor.execute('DELETE FROM chats WHERE user_from = %s OR user_to = %s', (user_id, user_id))
            self.conn.commit()

            cursor.execute('DELETE FROM items WHERE author_id = %s', (user_id,))
            self.conn.commit()

            cursor.execute('DELETE FROM users WHERE id = %s', (user_id,))
            self.conn.commit()

            return True
        
        except Error as e:
                
            print(e)
            self.log_error('Cannot delete user')
            return False
    
    def create_chat(self, **chat) -> int:
        """ create a new chat """

        if not self.check_validation_key(chat['user_from'], chat['vKey']):
            self.log_error('Unauthorized')
            raise HTTPException(status_code=401, detail='Unauthorized')
        
        try:

            cursor = self.conn.cursor()

            cursor.execute('SELECT * FROM chats WHERE user_from = %s AND user_to = %s AND item_id = %s', 
                        (chat['user_from'], chat['user_to'], chat['item_id']))

            row = cursor.fetchone()

            if row:
                return row[0]

            cursor.execute('INSERT INTO chats (user_from, user_to, item_id) VALUES (%s, %s, %s)', 
                        (chat['user_from'], chat['user_to'], chat['item_id']))

            self.conn.commit()

            return cursor.lastrowid
        
        except Error as e:

            print(e)
            self.log_error('Cannot create chat')
            return -1
        
    def get_chat(self, chat_id: int, user_id: int, vKey: str) -> dict:
        """ get a single chat """

        if not self.check_validation_key(user_id, vKey):
            self.log_error('Unauthorized')
            return {}
        
        if not self.get_user(user_id, vKey):
            self.log_error('User not found')
            return {}
        
        try:

            cursor = self.conn.cursor()

            cursor.execute('SELECT * FROM chats WHERE chat_id = %s', (chat_id,))

            row = cursor.fetchone()

            if not row:
                self.log_error('Chat not found')
                return {}
            
            if row[1] != int(user_id) and row[2] != int(user_id):
                self.log_error('Unauthorized')
                return {}

            keys = ('chat_id', 'user_from', 'user_to', 'item_id')

            return {key: value for key, value in zip(keys, row)} if row else {}

        except Error as e:

            print(e)
            self.log_error('Cannot get chat')
            return {}
        
    def get_chats(self, user_id: int, vKey: str) -> list:
        """ get all chats for a user """

        if not self.check_validation_key(user_id, vKey):
            self.log_error('Unauthorized')
            return []
        
        try:

            cursor = self.conn.cursor()

            cursor.execute('SELECT * FROM chats WHERE user_from = %s OR user_to = %s', (user_id, user_id))

            rows = cursor.fetchall()

            keys = ('chat_id', 'user_from', 'user_to', 'item_id')

            return [{key: value for key, value in zip(keys, row)} for row in rows]

        except Error as e:

            print(e)
            self.log_error('Cannot get chats')
            return []
        
    def delete_chat(self, chat_id: int, user_id: int, vKey: str) -> bool:
        """ delete a single chat """

        if not self.check_validation_key(user_id, vKey):
            self.log_error('Unauthorized')
            return False
        
        if not self.get_chat(chat_id, user_id, vKey):
            self.log_error('Chat not found')
            return False
        
        try:

            cursor = self.conn.cursor()

            cursor.execute('SELECT user_from, user_to FROM chats WHERE chat_id = %s', (chat_id,))
            row = cursor.fetchone()

            if row[0] != int(user_id) and row[1] != int(user_id):
                self.log_error('Unauthorized')
                return False

            cursor.execute('DELETE FROM chats WHERE chat_id = %s', (chat_id,))

            self.conn.commit()

            cursor.execute('DELETE FROM messages WHERE chat_id = %s', (chat_id,))

            self.conn.commit()

            return True
        
        except Error as e:

            print(e)
            self.log_error('Cannot delete chat')
            return False
        
    def create_message(self, chat_id: int, message: str, date : str, author_id: int, vKey: str) -> bool:
        """ create a new message """

        if not self.check_validation_key(author_id, vKey):
            self.log_error('Unauthorized')
            return False
        
        if not self.get_chat(chat_id, author_id, vKey):
            self.log_error('Chat not found')
            return False
        
        try:

            cursor = self.conn.cursor()

            cursor.execute('INSERT INTO messages (chat_id, user_from, message, date) VALUES (%s, %s, %s, %s)', 
               (chat_id, author_id, message, date))

            self.conn.commit()

            return True
        
        except Error as e:

            print(e)
            self.log_error('Cannot create message')
            return False
    
    def get_messages(self, chat_id: int, user_id: int, vKey: str) -> list:
        """ get all messages for a chat """
        
        try:

            cursor = self.conn.cursor()

            cursor.execute('SELECT * FROM messages WHERE chat_id = %s', (chat_id,))

            rows = cursor.fetchall()

            keys = ('message_id', 'chat_id', 'user_from', 'message', 'date')

            return [{key: value for key, value in zip(keys, row)} for row in rows]

        except Error as e:

            print(e)
            self.log_error('Cannot get messages')
            return []
        
    def delete_message(self, message_id: int, user_id: int, vKey: str) -> bool:
        """ delete a single message """
        
        if not self.check_validation_key(user_id, vKey):
            self.log_error('Unauthorized')
            return False
        
        try:

            cursor = self.conn.cursor()

            cursor.execute('SELECT user_from FROM messages WHERE message_id = %s', (message_id,))
            row = cursor.fetchone()

            if not row:
                self.log_error('Message not found')
                return False

            if row[0] != int(user_id):
                self.log_error('Unauthorized')
                return False

            cursor.execute('DELETE FROM messages WHERE message_id = %s', (message_id,))

            self.conn.commit()

            return True
        
        except Error as e:

            print(e)
            self.log_error('Cannot delete message')
            return False
        
    def update_message(self, message_id : int, message : str, author_id : int, vKey : str) -> bool:
        """ update a single message """
        
        if not self.check_validation_key(author_id, vKey):
            self.log_error('Unauthorized')
            return False
        
        if not message:
            self.log_error('Empty message')
            return False
        
        try:

            cursor = self.conn.cursor()

            cursor.execute('SELECT user_from FROM messages WHERE message_id = %s', (message_id,))

            row = cursor.fetchone()

            if not row:
                self.log_error('Message not found')
                return False

            if row[0] != int(author_id):
                self.log_error('Unauthorized')
                return False
        
            cursor.execute('''UPDATE messages SET message = %s WHERE message_id = %s''', (message, message_id))

            self.conn.commit()

            return True
        
        except Error as e:

            print(e)
            self.log_error('Cannot update message')
            return False

    def unauthorized_user(self) -> int:
        """ add a new unauthorized user """
        try:

            cursor = self.conn.cursor()

            cursor.execute('''INSERT INTO unauthorized_users (id, time) VALUES (NULL, CURRENT_TIMESTAMP)''')

            self.conn.commit()

            return cursor.lastrowid
        
        except Error as e:

            print(e)
            self.log_error('Cannot add unauthorized user')
            return -1
        
    def get_stats(self) -> dict:
        """ fetch statistics """
        try:

            cursor = self.conn.cursor()

            cursor.execute('SELECT COUNT(*) FROM users')
            users = cursor.fetchone()[0]

            cursor.execute('SELECT COUNT(*) FROM items')
            items = cursor.fetchone()[0]

            cursor.execute('SELECT COUNT(*) FROM unauthorized_users')
            visitors = cursor.fetchone()[0]

            cursor.execute('SELECT COUNT(*) FROM unauthorized_users WHERE time > DATE_SUB(NOW(), INTERVAL 1 DAY)')
            visitors_day = cursor.fetchone()[0]

            cursor.execute('SELECT COUNT(*) FROM errors')
            errors = cursor.fetchone()[0]

            return {'users': users, 'items': items, 'visitors': visitors, 'visitors_day': visitors_day, 'errors': errors}
        
        except Error as e:

            print(e)
            self.log_error('Cannot fetch stats')
            return {}
        
    def report_create(self) -> bool:
        pass

    def report_resolve(self) -> bool:
        pass

    def __del__(self) -> None:
        """ close the database connection """
        self.conn.close()
