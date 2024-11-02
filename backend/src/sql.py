"""
 * Project: ITU project - Garage sale website
 * @file sqlite.py

 * @brief sqlite database class for api

 * @author Neonila Mashlai - xmashl00

"""

import mysql.connector
from mysql.connector import Error
from src.config import DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD
from src.crypto import Crypto
from src.models import Optional
import os


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

            cursor.execute('''CREATE TABLE IF NOT EXISTS users (
                            id INT PRIMARY KEY AUTO_INCREMENT,
                            username VARCHAR(255) UNIQUE NOT NULL,
                            encrypted_password TEXT NOT NULL,
                            `key` TEXT NOT NULL,
                            name TEXT,
                            surname TEXT,
                            email TEXT,
                            phone TEXT,
                            address TEXT,
                            date_of_birth TEXT);
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

            cursor.execute('''CREATE TABLE IF NOT EXISTS unauthorized_users (
                            id INT PRIMARY KEY AUTO_INCREMENT);
            ''')

            self.conn.commit()

        except Error as e:
            print(e)
            exit(1)

    def insert_item(self, **item) -> bool:
        """ insert a new item into the items table """
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
            return {}

    def delete_item(self, item_id: int) -> bool:
        """ delete a single item from the items table """
        try:

            cursor = self.conn.cursor()

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
            return False

    def update_item(self, item_id: int, **item) -> bool:
        """ update a single item from the items table """
        try:

            cursor = self.conn.cursor()

            cursor.execute('''
                UPDATE items 
                SET name = %s, description = %s, price = %s, size = %s, category_id = %s, condition_id = %s, image_path = %s 
                WHERE id = %s
            ''', (item['name'], item['description'], item['price'], item['size'], item['categoryId'], item['conditionId'], item['image_path'], item_id))

            self.conn.commit()

            return True
        
        except Error as e:

            print(e)
            return False
        
    def register_user(self, **user) -> int:
        """ register a new user if username is not taken """
        try:

            if not user['username'] or not user['password']:
                return -2

            cursor = self.conn.cursor()

            cursor.execute('SELECT * FROM users WHERE username = %s', (user['username'],))
            row = cursor.fetchone()

            if row:
                return -1

            crypto = Crypto()
            encrypted = crypto.encrypt(user['password'])

            cursor.execute('INSERT INTO users (username, encrypted_password, `key`) VALUES (%s, %s, %s)', 
                        (user['username'], encrypted["encrypted_password"], encrypted["key"]))

            self.conn.commit()

            return 0
        
        except Error as e:

            print(e)
            return -3
        
    def login_user(self, **user) -> int:
        """ login a user and return user id if correct username and password are provided, 
        if user does not exist return -1, if password is incorrect return -2, else error return -3 """
        try:

            cursor = self.conn.cursor()

            cursor.execute('SELECT * FROM users WHERE username = %s', (user['username'],))

            row = cursor.fetchone()

            if not row:
                return -1

            crypto = Crypto()
            decrypted = crypto.decrypt(row[2], row[3])

            if decrypted != user['password']:
                return -2

            return row[0]
        
        except Error as e:

            print(e)
            return -3
        
    def get_user_items_bd(self, user_id: int) -> list:
        """ get all items from the items table """
        try:

            cursor = self.conn.cursor()

            cursor.execute('SELECT * FROM items WHERE author_id = %s', (user_id,))

            rows = cursor.fetchall()

            keys = ('id', 'name', 'description', 'price', 'size', 'categoryId', 'conditionId', 'image_path', 'author_id')

            return [{key: value for key, value in zip(keys, row)} for row in rows]
        
        except Error as e:

            print(e)
            return None
        
    def get_user(self, user_id : int) -> dict:
        """ get a single user from the users table """
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
            return {}
        
    def update_user(self, user_id : int, **user) -> bool:
        """ update a single user from the users table """
        try:

            cursor = self.conn.cursor()

            cursor.execute('UPDATE users SET name = %s, surname = %s, email = %s, phone = %s, address = %s, date_of_birth = %s WHERE id = %s', 
                        (user['name'], user['surname'], user['email'], user['phone'], user['address'], user['date_of_birth'], user_id))

            self.conn.commit()

            return True

        except Error as e:

            print(e)
            return False
        
    def create_chat(self, **chat) -> int:
        """ create a new chat """
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
            return -1
        
    def get_chat(self, chat_id: int) -> dict:
        """ get a single chat """
        try:

            cursor = self.conn.cursor()

            cursor.execute('SELECT * FROM chats WHERE chat_id = %s', (chat_id,))

            row = cursor.fetchone()

            keys = ('chat_id', 'user_from', 'user_to', 'item_id')

            return {key: value for key, value in zip(keys, row)} if row else {}

        except Error as e:

            print(e)
            return {}
        
    def get_chats(self, user_id: int) -> list:
        """ get all chats for a user """
        try:

            cursor = self.conn.cursor()

            cursor.execute('SELECT * FROM chats WHERE user_from = %s OR user_to = %s', (user_id, user_id))

            rows = cursor.fetchall()

            keys = ('chat_id', 'user_from', 'user_to', 'item_id')

            return [{key: value for key, value in zip(keys, row)} for row in rows]

        except Error as e:

            print(e)
            return []
        
    def delete_chat(self, chat_id: int) -> bool:
        """ delete a single chat """
        try:

            cursor = self.conn.cursor()

            cursor.execute('DELETE FROM chats WHERE chat_id = %s', (chat_id,))

            self.conn.commit()

            cursor.execute('DELETE FROM messages WHERE chat_id = %s', (chat_id,))

            self.conn.commit()

            return True
        
        except Error as e:

            print(e)
            return False
        
    def create_message(self, **message) -> int:
        """ create a new message """
        try:

            cursor = self.conn.cursor()

            cursor.execute('INSERT INTO messages (chat_id, user_from, message, date) VALUES (%s, %s, %s, %s)', 
               (message['chat_id'], message['user_from'], message['message'], message['date']))

            self.conn.commit()

            return cursor.lastrowid
        
        except Error as e:

            print(e)
            return -1
    
    def get_messages(self, chat_id: int) -> list:
        """ get all messages for a chat """
        try:

            cursor = self.conn.cursor()

            cursor.execute('SELECT * FROM messages WHERE chat_id = %s', (chat_id,))

            rows = cursor.fetchall()

            keys = ('message_id', 'chat_id', 'user_from', 'message', 'date')

            return [{key: value for key, value in zip(keys, row)} for row in rows]

        except Error as e:

            print(e)
            return []
        
    def delete_message(self, message_id: int) -> bool:
        """ delete a single message """
        try:

            cursor = self.conn.cursor()

            cursor.execute('DELETE FROM messages WHERE message_id = %s', (message_id,))

            self.conn.commit()

            return True
        
        except Error as e:

            print(e)
            return False
        
    def update_message(self, message_id: int, **message) -> bool:
        """ update a single message """
        try:

            cursor = self.conn.cursor()

            cursor.execute('''UPDATE messages SET message = %s WHERE message_id = %s''', (message['message'], message_id))

            self.conn.commit()

            return True
        
        except Error as e:

            print(e)
            return False

    def unauthorized_user(self) -> int:
        """ add a new unauthorized user """
        try:

            cursor = self.conn.cursor()

            cursor.execute('''INSERT INTO unauthorized_users (id) VALUES (NULL)''')

            self.conn.commit()

            return cursor.lastrowid
        
        except Error as e:

            print(e)
            return -1

    def __del__(self) -> None:
        """ close the database connection """
        self.conn.close()
