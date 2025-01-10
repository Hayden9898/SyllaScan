# Makefile

# Define variables for host, port, and module
MODULE = main:app
HOST = 0.0.0.0
PORT = 8000

setup:
	cd app && pip install -r requirements.txt
	cd ../frontend && npm install

# Start the server
prod-front:
	cd frontend && npm install && npm run build

# Run the server
prod-back:
	cd app && uvicorn $(MODULE) --host $(HOST) --port $(PORT)

# Start the server with reload
dev-back:
	cd app && uvicorn $(MODULE) --host $(HOST) --port $(PORT) --reload --log-level debug

# Start the frontend
dev-front:
	cd frontend && npm start

# Linting with flake8
lint:
	flake8 .

# Run tests with pytest
test:
	pytest

# Clean up __pycache__ files
clean:
	find . -name "__pycache__" -type d -exec rm -r {} +
