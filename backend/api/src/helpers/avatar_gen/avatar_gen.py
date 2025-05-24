import base64
import hashlib
import random
from io import BytesIO

import requests
from PIL import Image, ImageOps

from .constants import BACKGROUND_COLOR, RAW_IMAGE_HALF_SIZE, RAW_IMAGE_SIZE


# Этот класс генерирует фотографии аватарок как на GitHub и грузит их на фри хост
# УРЛ хоста надо в БД будет закидывать
class AvatarGenerator:
    def __init__(self, generate_string: str):
        self.generate_string = generate_string

    def __generate_avatar(self) -> str:
        """
        Generate avatar from string

        Returns:
          string of base64 encoded image data
        """
        seed = hashlib.md5(self.generate_string.encode()).digest()
        random.seed(seed)

        foreground_image = (
            random.randint(100, 220),
            random.randint(100, 220),
            random.randint(100, 220),
        )

        with Image.new("P", (RAW_IMAGE_SIZE, RAW_IMAGE_SIZE), 0) as img:
            img.putpalette(BACKGROUND_COLOR + foreground_image)

            px = img.load()
            for _ in range(random.randint(5, 14)):
                x = random.randrange(0, RAW_IMAGE_HALF_SIZE)
                y = random.randrange(0, RAW_IMAGE_SIZE)
                px[x, y] = 1
                px[-1 - x, y] = 1

            img = img.resize((480, 480), Image.NEAREST)
            img = ImageOps.expand(img, 1, 0)

            buffer = BytesIO()
            img.save(buffer, format="PNG")
            to_save_data = base64.b64encode(buffer.getvalue()).decode()

        return to_save_data

    def generate_avatar_url(self) -> str:
        """Загрузка сгенерированного изображения на ImgBB

        Returns:
            str: ссылка на изображение
        """
        key = "6dc980df0dd2daa9e56f5b48051c2040"  # TODO: .env variable
        url = f"https://api.imgbb.com/1/upload?key={key}"
        save_data = self.__generate_avatar()

        response = requests.post(
            url,
            data={
                "image": save_data,
            },
        )

        return response.json().get("data").get("display_url")
