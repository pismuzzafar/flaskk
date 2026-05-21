from flask import Flask, render_template, request

application = Flask(__name__)

@application.route('/', methods=['GET', 'POST'])
def index():
   if request.method == 'POST':
      namaDepan = request.form['namaDepan']
      namaBelakang = request.form['namaBelakang']
      nama = '%s %s' % (namaDepan, namaBelakang)
      return render_template('response.html', nama=nama)
   return render_template('form.html')

if __name__ == '__main__':
   application.run(debug=True)
