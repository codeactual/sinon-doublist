dsinon-doublistt: components index.js
	@component build --standalone sinonDoublist --name sinon-doublist

build: components index.js
	@component build --standalone sinonDoublist --name build --dev

components: component.json
	@component install --dev

clean:
	rm -fr build

.PHONY: clean
