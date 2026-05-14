for f in ./*.jpg ; do magick "$f" -auto-orient -resize 400x300 -quality 50% -strip -interlace Plane -sampling-factor 4:2:0 -define jpeg:dct-method=float "thumb/${f%.jpg}.jpg" ; done
