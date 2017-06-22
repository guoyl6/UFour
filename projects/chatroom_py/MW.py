# coding=utf-8
import json
import os.path
import tornado.httpserver
import tornado.options
import tornado.web
import thread
import time
import random
import re

from tornado.options import define, options
define("port", default=8888, help="run on the given port", type=int)

UserId = []
Words = []
Picture = []
showing = ['']

def getId():
    FT = open('static/data/userid.txt');
    for i in FT:
        if (len(i) == 0):
            continue
        UserId.append(i.strip('\r\n'))
    FT.close()

def getWords():
    FT = open('static/data/words.txt')
    for i in FT:
        if (len(i) == 0):
            continue
        Words.append(json.loads(i.strip('\r\n')))
    FT.close()

def getPictures():
    pic = os.listdir('static/data/images')
    if (len(pic) == 0):
        return
    for i in pic:
        Picture.append(i)

def freshid():
    FT = open('static/data/userid.txt', 'w');
    for i in UserId:
        if (len(i) == 0):
            continue
        FT.write(i + '\n')
    FT.close()

def freshword(temp):
    FT = open('static/data/words.txt', 'a+');
    FT.write(json.dumps(temp) + '\n')
    FT.close()

def freshpic():
    while 1:
        if (len(Picture) == 0):
            continue
        index = random.randint(0, len(Picture) - 1)
        showing[0] = Picture[index]
        time.sleep(10)


class BaseHandler(tornado.web.RequestHandler):
    def get_current_user(self):
        return self.get_secure_cookie("id")

class Init(BaseHandler):
    def get(self):
        if self.current_user and UserId.count(self.current_user) == 0:
            self.clear_cookie('id')
            self.redirect('/')
            return
        self.render('index.html', ID=self.current_user, index=len(Words))

class Login(BaseHandler):
    def get(self):
        if (self.current_user):
            self.redirect('/')
        else:
            self.render('login.html')
    def post(self):
        temp = self.get_argument('id', '')
        if temp[0] == '[' and temp[-1] == ']':
            self.write('[***]:管理员专用符号')
        elif UserId.count(temp):
            self.write('The ID has exist....')  
        else:
            self.write('')

class Index(BaseHandler):
    def get(self):
        self.redirect('/')
    def post(self):
        Id = self.get_argument('id', '')
        if Id and UserId.count(Id) == 0:
            UserId.append(Id)
            self.set_secure_cookie('id', Id)
            freshid()

class Send(BaseHandler):
    def get(self):
        self.redirect('/')
    def post(self):
        if self.current_user and UserId.count(self.current_user) == 0:
            self.clear_cookie("id")
            self.write("Your ID don't exist...")
        else:
            words = self.get_argument('words', '');
            words = json.loads(words)
            temp = {
                'value': words['value']
            }
            if words['not_name'] or not self.current_user:
                temp['name'] = '[路人]'
            else:
                temp['name'] = self.current_user
            Words.append(temp)
            freshword(temp)

class New(BaseHandler):
    def get(self):
        self.redirect('/')
    def post(self):
        index = self.get_argument('index', '')
        if not index:
            return
        index = int(index);
        if (index == len(Words)):
            pass
        else:
            self.write(json.dumps(Words[index:]))

class NewPic(BaseHandler):
    def get(self):
        self.redirect('/')
    def post(self):
        self.write(json.dumps({'showing':showing[0], 'length': len(Picture)}))

class Image(BaseHandler):
    def get(self):
        self.redirect('/')
    def post(self):
        photo = self.request.files['pic']
        for i in photo:
            path = str(len(os.listdir('static/data/images'))) + '.jpg'
            add = open('static/data/images/' + path, 'wb')
            add.write(i['body'])
            add.close
            Picture.append(path)
        self.write(json.dumps({"msg": path}))

class More(BaseHandler):
    def get(self):
        self.redirect('/')
    def post(self):
        index = self.get_argument('index', '')
        if not index:
            return
        index = int(index)
        index2 = index - 10
        if (index <= 0):
            self.write('')
        else:
            if index2 < 0:
                index2 = 0
            self.write(json.dumps(Words[index2:index]))

class NotFound(BaseHandler):
    def get(self, input):
        self.redirect('/')

if __name__ == "__main__":
    getId()
    getWords()
    getPictures()
    thread.start_new_thread(freshpic, ())
    tornado.options.parse_command_line()
    app = tornado.web.Application(
        handlers=[
            (r"/", Init),
            (r"/login", Login),
            (r"/index", Index),
            (r'/send', Send),
            (r'/new', New),
            (r'/newpic', NewPic),
            (r'/image', Image),
            (r'/more', More),
            (r'/(\w+)', NotFound)
        ],
        template_path=os.path.join(os.path.dirname(__file__), "template"),
        static_path=os.path.join(os.path.dirname(__file__), "static"),
        cookie_secret="61oETzKXQAGaYdkL5gEmGeJJFuYh7EQnp2XdTP1o/Vo=",
        xsrf_cookies=False,
        debug=True,
    )
    http_server = tornado.httpserver.HTTPServer(app)
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()
