.PHONY: setup build run dev clean

BINARY := bin/server
PORT   ?= 3000
GO     := go

# ─── Setup: copy assets from tmp/ into static/ with clean English names ──────
setup:
	@echo "» Creating static directory structure..."
	@mkdir -p \
		static/images/logo \
		static/images/photos \
		static/images/projects/belle-view \
		static/images/projects/kazybek \
		static/images/projects/arena-park \
		static/images/projects/arena-park-2 \
		static/images/projects/arman \
		static/images/projects/office

	@echo "» Copying logo assets..."
	@cp "tmp/для сайта/лого/Madina-Bekassyl_black_high-res (1).png" \
		static/images/logo/logo-black.png
	@cp "tmp/для сайта/лого/Madina-Bekassyl_white_high-res (1).png" \
		static/images/logo/logo-white.png
	@cp "tmp/для сайта/лого/Signature Animation/Madina_Bekassyl Transparent.gif" \
		static/images/logo/signature.gif
	@cp "tmp/для сайта/лого/Signature Animation/Madina_Bekassyl_Black Transaprent.gif" \
		static/images/logo/signature-black.gif

	@echo "» Copying photos..."
	@cp "tmp/для сайта/мое фото/IMG_4964.JPG" \
		static/images/photos/portrait.jpg
	@cp "tmp/для сайта/мое фото/IMG_4970.JPG" \
		static/images/photos/portrait-2.jpg

	@echo "» Copying project — Belle View..."
	@cp "tmp/для сайта/проекты/Belle view /Bedroom 1.jpg" \
		static/images/projects/belle-view/bedroom-1.jpg
	@cp "tmp/для сайта/проекты/Belle view /Hall 2.jpg" \
		static/images/projects/belle-view/hall-2.jpg
	@cp "tmp/для сайта/проекты/Belle view /1.png" \
		static/images/projects/belle-view/cover.png
	@cp "tmp/для сайта/проекты/Belle view /BATH master 1.jpg" \
		static/images/projects/belle-view/bath.jpg
	@cp "tmp/для сайта/проекты/Belle view /Kids room 2.png" \
		static/images/projects/belle-view/kids-room.png

	@echo "» Copying project — Kazybek Bi..."
	@cp "tmp/для сайта/проекты/Kazybek bi/1.1.png" \
		static/images/projects/kazybek/cover.png
	@cp "tmp/для сайта/проекты/Kazybek bi/Bedroom 2.1.png" \
		static/images/projects/kazybek/bedroom.png
	@cp "tmp/для сайта/проекты/Kazybek bi/Kidsroom 1.2.png" \
		static/images/projects/kazybek/kidsroom.png
	@cp "tmp/для сайта/проекты/Kazybek bi/Wardrobe 1.1.png" \
		static/images/projects/kazybek/wardrobe.png

	@echo "» Copying project — Arena Park..."
	@cp "tmp/для сайта/проекты/Arena Park/hall_1.jpg" \
		static/images/projects/arena-park/cover.jpg
	@cp "tmp/для сайта/проекты/Arena Park/bedroom_1.jpg" \
		static/images/projects/arena-park/bedroom.jpg
	@cp "tmp/для сайта/проекты/Arena Park/Kitchen_2.jpg" \
		static/images/projects/arena-park/kitchen.jpg
	@cp "tmp/для сайта/проекты/Arena Park/bath_1.jpg" \
		static/images/projects/arena-park/bath.jpg

	@echo "» Copying project — Arena Park 2..."
	@cp "tmp/для сайта/проекты/Arena park 2/Living room 1.1.png" \
		static/images/projects/arena-park-2/cover.png
	@cp "tmp/для сайта/проекты/Arena park 2/Hall 1.png" \
		static/images/projects/arena-park-2/hall.png
	@cp "tmp/для сайта/проекты/Arena park 2/Kitchen 1.1.png" \
		static/images/projects/arena-park-2/kitchen.png
	@cp "tmp/для сайта/проекты/Arena park 2/Bedroom 2.1.png" \
		static/images/projects/arena-park-2/bedroom.png

	@echo "» Copying project — Arman..."
	@cp "tmp/для сайта/проекты/Arman /гостиная 1.png" \
		static/images/projects/arman/cover.png
	@cp "tmp/для сайта/проекты/Arman /кухня 11.png" \
		static/images/projects/arman/kitchen.png
	@cp "tmp/для сайта/проекты/Arman /столовая 1.png" \
		static/images/projects/arman/dining.png

	@echo "» Copying project — Office..."
	@cp "tmp/для сайта/проекты/Office/01-Reception 2 .png" \
		static/images/projects/office/cover.png
	@cp "tmp/для сайта/проекты/Office/02-Open space 2.png" \
		static/images/projects/office/open-space.png
	@cp "tmp/для сайта/проекты/Office/07-Meeting room 1.png" \
		static/images/projects/office/meeting-room.png

	@echo "✓ Assets ready in static/"

# ─── Build ────────────────────────────────────────────────────────────────────
build:
	@echo "» Building..."
	@mkdir -p bin
	@$(GO) build -o $(BINARY) ./cmd/server
	@echo "✓ Binary: $(BINARY)"

# ─── Run (build then start) ───────────────────────────────────────────────────
run: build
	@echo "» Starting on http://localhost:$(PORT)"
	@PORT=$(PORT) ./$(BINARY)

# ─── Dev (no binary, live template reload via go run) ─────────────────────────
dev:
	@echo "» Dev mode on http://localhost:$(PORT)"
	@PORT=$(PORT) $(GO) run ./cmd/server

# ─── Clean ────────────────────────────────────────────────────────────────────
clean:
	@rm -rf bin/
	@echo "✓ Cleaned"
