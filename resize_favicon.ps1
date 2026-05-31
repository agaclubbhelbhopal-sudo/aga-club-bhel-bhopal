# Load System.Drawing assembly
Add-Type -AssemblyName System.Drawing

# Define paths
$inputPath = "images\aga_club_site.jpg"
$outputPath = "images\favicon.jpg"

# Load the image
$image = [System.Drawing.Image]::FromFile($inputPath)

# Create a new bitmap with 50x50 size
$bitmap = New-Object System.Drawing.Bitmap 50, 50

# Create a graphics object for drawing
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

# Set high quality rendering
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

# Draw the resized image
$graphics.DrawImage($image, 0, 0, 50, 50)

# Save the resized image
$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)

# Clean up
$graphics.Dispose()
$bitmap.Dispose()
$image.Dispose()

Write-Host "Favicon resized successfully to 50x50 pixels"