
import io
import os
import re
import requests

from lxml import html


class DcCON:
    "Dccon Package Javascript: https://dccon.dcinside.com/_js/dc_common.js?1"


    def __init__(self):
        self.url = 'https://dccon.dcinside.com'
        self.url_package = 'https://dccon.dcinside.com/index/package_detail'
        self.url_download = 'https://dcimg5.dcinside.com/dccon.php'

        self.headers_package = { 'X-Requested-With': 'XMLHttpRequest' }
        self.headers_download = { 'Referer': self.url+'/' }

        self.paging_box_selector = 'div.bottom_paging_box.iconpaging a'
        self.end_page_selector = 'a.sp_pagingicon.page_end'
        self.dccon_package = 'li.div_package'

        pattern = r'https://dccon.dcinside.com/.*?/([0-9]*)?'
        self.pattern = re.compile(pattern)

        self.options = {
            'sort': {
                'eng': ('hot', 'new'),
                'kor': ('인기순', '최신순')
            },
            'order': {
                'eng': ('title', 'nick_name', 'tags'),
                'kor': ('디시콘명', '닉네임', '태그')
            }
        }


    def search(self, keyword, sort='hot', order='title'):
        sort_opts = self.options['sort']
        order_opts = self.options['order']

        sort = sort.lower()
        order = order.lower()
        if sort in sort_opts['kor']:
            sort_idx = sort_opts['kor'].index(sort)
            sort = sort_opts['eng'][sort_idx]
        else:
            sort = sort_opts['eng'][0]
        if order in order_opts['kor']:
            order_idx = order_opts['kor'].index(order)
            order = order_opts['eng'][order_idx]
        else:
            order = order_opts['eng'][0]

        dccon_packages = self._get_dccon_packages(
            keyword=keyword,
            sort=sort,
            order=order
        )
        return dccon_packages


    def download(self, dccon_id, path_dir='./'):
        pkg_idx = ''.join(filter(str.isalnum, str(dccon_id)))
        url = self.url_download
        headers = self.headers_download

        data = self._get_package_data(pkg_idx)
        info, detail = data['info'], data['detail']

        title = info.get('title', pkg_idx)
        path = os.path.join(path_dir, title)
        try:
            os.makedirs(path)
        except FileExistsError:
            pass
        finally:
            for i, pkg in enumerate(detail):
                params = { 'no': pkg['path'] }
                image = requests.get(url, headers=headers, params=params)
    
                name, ext = pkg.get('idx', i), pkg.get('ext', 'png')
                filename = os.path.join(path, f'{name}.{ext}')
                with open(filename, 'wb') as file:
                    file.write(image.content)
            else:
                return title


    def _get_package_data(self, package_idx):
        headers = self.headers_package
        cookie = self._get_cookie()
        url_pkg = self.url_package

        data = { 'ci_t': cookie, 'package_idx': package_idx }
        packages = requests.post(url_pkg, headers=headers, data=data)
        pkg_data = packages.json()
        return pkg_data


    def _get_dccon_packages(self, keyword, sort='hot', order='title'):
        result = []
        pages = self._get_dccon_pages(
            keyword=keyword,
            sort=sort,
            order=order
        )
        for page in pages:
            docs = html.fromstring(page.content)
            packages = docs.cssselect(self.dccon_package)
            for package in packages:
                children = package.getchildren()
                if children:
                    # Image Link, Main Thumbnail, Name, Author
                    child = children[-1]
                    img, strong, span = child.getchildren()[:3]
                    src = img.get('src')
                    thumbnail_image = requests.get(src)

                    link = child.get('href')
                    thumbnail = io.BytesIO(thumbnail_image.content)
                    name = strong.text
                    author = span.text

                    childs = (link, thumbnail, name, author)
                    result.append(childs)
        return result


    def _get_dccon_pages(self, keyword, sort='hot', order='title'):
        url = f'{self.url}/{sort}/1/{order}/{keyword}'
        last = self._get_last_page_no(url)
        pages = [
            requests.get(f'{self.url}/{sort}/{i}/{order}/{keyword}')
            for i in range(1, last+1)
        ]
        return pages


    def _get_last_page_no(self, url):
        dccon_page = requests.get(url)
        docs = html.fromstring(dccon_page.content)
        last_page = docs.cssselect(self.end_page_selector)
        if last_page:
            link = last_page[0].get('href')
        else:
            paging_box = docs.cssselect(self.paging_box_selector)
            if paging_box:
                link = paging_box[-1].get('href')
            else:
                return 1

        search_no = self.pattern.search(link)
        last_page_no = search_no.group(1)
        return int(last_page_no)


    def _get_cookie(self):
        url = self.url_package
        headers = self.headers_package
        page = requests.get(url, headers=headers)
        cookie = page.cookies.get('ci_c', '')
        return cookie
