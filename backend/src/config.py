"""
 * Project: IIS project - Garage sale website
 * @file config.py

 * @brief file for configuration parsing

 * @author Neonila Mashlai - xmashl00

"""

from configparser import ConfigParser
import os

config = ConfigParser()
config.read(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config.ini'))

DATABASE_HOST = config['database']['host']
DATABASE_PORT = int(config['database']['port'])
DATABASE_USER = config['database']['user']
DATABASE_PASSWORD = config['database']['password']

ENDPOINT_HOST = config['endpoint']['host']
ENDPOINT_PORT = int(config['endpoint']['port'])