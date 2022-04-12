
import webbrowser

import tkinter as tk
import tkinter.ttk as ttk

from tkinter import messagebox as mb

from PIL import Image
from PIL import ImageTk

from.dccon import DcCON


def resize_window(master, width=840, height=500):
    ws = master.winfo_screenwidth()
    hs = master.winfo_screenheight()

    x = int((ws / 2) - (width / 2))
    y = int((hs / 2) - (height / 2))

    master.geometry(f'{width}x{height}+{x}+{y}')


class Menubar:

    def __init__(self):
        self._menu = tk.Menu(tearoff=False)
        self.initialization()


    @property
    def menu(self):
        return self._menu


    def initialization(self):
        infomenu = self.generate_infomenu()
        self._menu.add_cascade(label='정보', menu=infomenu)


    def generate_infomenu(self):
        url_blog = 'https://iamjjintta.tistory.com/'
        url_github = 'https://github.com/iam-jjintta/'
        menu = tk.Menu(tearoff=False)
        menu.add_command(
            label='찐따 격리소',
            command=lambda: webbrowser.open(url_blog)
        )
        menu.add_command(
            label='흔한 찐따의 GitHub 페이지',
            command=lambda: webbrowser.open(url_github)
        )
        return menu


class Downloader(ttk.Frame):

    def __init__(self, master=None, title='DC-CON Downloader', icon=None):
        super().__init__(master)
        self.icon = icon
        self.dccon = DcCON()

        self.col_names = ('썸네일', '번호', '디시콘명', '닉네임')
        self.cols = tuple([f'#{i}' for i in range(len(self.col_names))])
        sort_opts = self.dccon.options['sort']['kor']
        order_opts = self.dccon.options['order']['kor']
        self.sort_opts = sort_opts
        self.order_opts = order_opts

        self.setting_window(title)
        self.create_widgets()
        self.setting_widgets()
        self.grid_widgets()
        self.bind_events()


    def setting_window(self, title, width=840, height=500):
        self.master.title(title)
        if self.icon:
            self.master.iconbitmap(self.icon)
        resize_window(self.master, width, height)
        self.master.resizable(False, False)
        self.master.rowconfigure(0, weight=1)
        self.master.columnconfigure(0, weight=1)
        self.grid(row=0, column=0, sticky=tk.NSEW)


    def create_widgets(self):
        self.menubar = Menubar()
        self.cb_sort = ttk.Combobox(self.master)
        self.cb_order = ttk.Combobox(self.master)
        self.ety_keyword = tk.Entry(self.master)
        self.btn_search = tk.Button(self.master)
        self.trv_dccon = ttk.Treeview(self.master)
        self.sb_dccon = ttk.Scrollbar(self.master)


    def setting_widgets(self):
        self.cb_sort['width'] = 10
        self.cb_sort['values'] = self.sort_opts
        self.cb_sort['state'] = 'readonly'
        self.cb_sort.set('정렬 옵션')

        self.cb_order['width'] = 10
        self.cb_order['values'] = self.order_opts
        self.cb_order['state'] = 'readonly'
        self.cb_order.set('검색 옵션')

        self.btn_search['text'] = '검색'
        self.btn_search['width'] = 20

        self.style = ttk.Style(self.master)
        self.style.configure('Treeview', rowheight=38)
        self.trv_dccon['columns'] = self.cols[1:]
        # self.trv_dccon['displaycolumns'] = self.cols[1:]
        # self.trv_dccon['show'] = 'headings'
        self.sb_dccon['orient'] = tk.VERTICAL
        self.trv_dccon.configure(yscroll=self.sb_dccon.set)

        self.master.config(menu=self.menubar.menu)


    def grid_widgets(self):
        self.cb_sort.grid(row=0, column=0, sticky=tk.W)
        self.cb_order.grid(row=1, column=0, sticky=tk.W)
        self.ety_keyword.grid(row=2, column=0, columnspan=2, sticky=tk.EW)
        self.btn_search.grid(row=2, column=2, sticky=tk.EW)

        anchor = 'center'
        for col, name in zip(self.cols, self.col_names):
            self.trv_dccon.heading(col, text=name, anchor=anchor)
            # width = 135 if col != self.cols[0] else 400
            self.trv_dccon.column(col, anchor=anchor, width=150)
        else:
            self.trv_dccon.grid(row=3, column=0, columnspan=4, sticky=tk.NSEW)
            self.sb_dccon.grid(row=3, column=4, sticky=tk.N+tk.S)


    def bind_events(self):
        self.sb_dccon['command'] = self.trv_dccon.yview
        self.btn_search['command'] = lambda: self.search()
        self.trv_dccon.bind('<Double-1>', self.ask_download)


    def search(self):
        keyword = self.ety_keyword.get()
        if keyword is None or keyword == '':
            title = '검색 경고'
            msg = '먼저 검색어를 입력해야 합니다.'
            mb.showwarning(title=title, message=msg)
            return

        sort = self.cb_sort.get()
        order = self.cb_order.get()

        self.clear()
        dccons = self.dccon.search(keyword=keyword, sort=sort, order=order)
        size = (30, 30)
        self.trv_dccon.images = []
        for no, thumbnail, name, author in dccons:
            # image = ImageTk.PhotoImage(data=thumbnail)
            image = Image.open(thumbnail)
            image = image.resize(size, Image.ANTIALIAS)
            image = ImageTk.PhotoImage(image)
            self.trv_dccon.images.append(image)

            values = (no, name, author)
            self.trv_dccon.insert('', tk.END, iid=no, image=image, values=values, tags=author)


    def ask_download(self, event):
        title = '디시콘 다운로드'
        msg = '해당 디시콘을 다운로드 하시겠습니까?'
        msgbox = mb.askquestion(title=title, message=msg)
        if msgbox == 'yes':
            path_dir = './디시콘'
            self.download(path_dir=path_dir)
            
            title = '다운로드 완료'
            msg = '다운로드가 완료되었습니다.'
            mb.showinfo(title=title, message=msg)


    def download(self, path_dir='./'):
        item = self.trv_dccon.selection()
        dccon_id = item[0]
        self.dccon.download(dccon_id=dccon_id, path_dir=path_dir)


    def clear(self):
        items = self.trv_dccon.get_children()
        self.trv_dccon.delete(*items)
