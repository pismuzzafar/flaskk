from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)

basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'climapledge.db')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL', f'sqlite:///{db_path}'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


class Pledge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    location = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'location': self.location,
            'category': self.category,
            'description': self.description,
            'createdAt': self.created_at.strftime('%d %b %Y, %H:%M')
        }


with app.app_context():
    db.create_all()


# Pages
@app.route('/')
def landing():
    return render_template('landing.html')


@app.route('/pledge/new')
def pledge_form():
    return render_template('form.html')


@app.route('/pledges')
def pledges_list():
    return render_template('pledges.html')


# JSON API
@app.route('/api/pledges', methods=['GET'])
def list_pledges():
    items = Pledge.query.order_by(Pledge.created_at.desc()).all()
    return jsonify([p.to_dict() for p in items])


@app.route('/api/pledges', methods=['POST'])
def create_pledge():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    location = (data.get('location') or '').strip()
    category = (data.get('category') or '').strip()
    description = (data.get('description') or '').strip()

    if not name or not location or not category or not description:
        return jsonify({'success': False, 'error': 'All fields are required'}), 400

    pledge = Pledge(name=name, location=location, category=category, description=description)
    db.session.add(pledge)
    db.session.commit()
    return jsonify({'success': True, 'pledge': pledge.to_dict()})


@app.route('/api/pledges/<int:pledge_id>', methods=['DELETE'])
def delete_pledge(pledge_id):
    item = Pledge.query.get_or_404(pledge_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({'success': True})


if __name__ == '__main__':
    app.run(debug=True)