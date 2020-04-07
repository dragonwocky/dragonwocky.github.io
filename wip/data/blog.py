from notion.client import NotionClient
from dotenv import load_dotenv
import os
load_dotenv()

client = NotionClient(token_v2=os.getenv('NOTION_TOKEN'))
page = client.get_block('45f15ad6b0ba405d8f316784cffedec8')

for block in page.children:
    print(block.__class__)
