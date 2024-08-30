# Makefile

# Define variables for host, port, and module
MODULE = main:app
HOST = 0.0.0.0
PORT = 8000

# Run the server
run:
	uvicorn $(MODULE) --host $(HOST) --port $(PORT)

# Start the server with reload
dev:
	uvicorn $(MODULE) --host $(HOST) --port $(PORT) --reload

# Linting with flake8
lint:
	flake8 .

# Run tests with pytest
test:
	pytest

# Clean up __pycache__ files
clean:
	find . -name "__pycache__" -type d -exec rm -r {} +
