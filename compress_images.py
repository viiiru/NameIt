#!/usr/bin/env python3
"""
Image compression script for NameIt game
Compresses all JPG images to reduce file size for faster loading
"""

from PIL import Image
import os
import glob

def compress_image(input_path, output_path, quality=85, max_size=(800, 800)):
    """
    Compress an image file.
    
    Args:
        input_path: Path to original image
        output_path: Path to save compressed image
        quality: JPEG quality (1-100, lower = smaller file)
        max_size: Maximum dimensions (width, height)
    """
    try:
        # Open the image
        img = Image.open(input_path)
        
        # Convert RGBA to RGB if needed (JPG doesn't support transparency)
        if img.mode in ('RGBA', 'LA', 'P'):
            # Create white background
            rgb_img = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            rgb_img.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
            img = rgb_img
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize if image is too large (maintains aspect ratio)
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Save with compression
        img.save(output_path, 'JPEG', quality=quality, optimize=True)
        
        # Get file sizes
        original_size = os.path.getsize(input_path) / 1024  # KB
        compressed_size = os.path.getsize(output_path) / 1024  # KB
        reduction = ((original_size - compressed_size) / original_size) * 100
        
        return original_size, compressed_size, reduction
    except Exception as e:
        print(f"Error compressing {input_path}: {e}")
        return None, None, None

def main():
    print("=" * 60)
    print("NameIt Image Compression Tool")
    print("=" * 60)
    print()
    
    # Compress images in the images/ folder
    images_dir = "images"
    if os.path.exists(images_dir):
        print(f"Compressing images in '{images_dir}/' folder...")
        print("-" * 60)
        
        image_files = glob.glob(os.path.join(images_dir, "*.jpg")) + \
                     glob.glob(os.path.join(images_dir, "*.jpeg")) + \
                     glob.glob(os.path.join(images_dir, "*.png"))
        
        total_original = 0
        total_compressed = 0
        
        for img_path in image_files:
            filename = os.path.basename(img_path)
            # Create backup
            backup_path = img_path + ".backup"
            if not os.path.exists(backup_path):
                import shutil
                shutil.copy2(img_path, backup_path)
                print(f"Created backup: {backup_path}")
            
            # Compress
            original, compressed, reduction = compress_image(
                img_path, 
                img_path, 
                quality=85,  # Good quality, smaller size
                max_size=(800, 800)  # Max 800x800 pixels
            )
            
            if original and compressed:
                total_original += original
                total_compressed += compressed
                print(f"{filename:20s} {original:8.1f} KB -> {compressed:8.1f} KB ({reduction:5.1f}% smaller)")
        
        print("-" * 60)
        total_reduction = ((total_original - total_compressed) / total_original) * 100 if total_original > 0 else 0
        print(f"{'Total:':20s} {total_original:8.1f} KB -> {total_compressed:8.1f} KB ({total_reduction:5.1f}% smaller)")
        print()
    
    # Compress images in the image_first picture/ folder
    first_picture_dir = "image_first picture"
    if os.path.exists(first_picture_dir):
        print(f"Compressing images in '{first_picture_dir}/' folder...")
        print("-" * 60)
        
        image_files = glob.glob(os.path.join(first_picture_dir, "*.jpg")) + \
                     glob.glob(os.path.join(first_picture_dir, "*.jpeg")) + \
                     glob.glob(os.path.join(first_picture_dir, "*.png"))
        
        for img_path in image_files:
            filename = os.path.basename(img_path)
            # Create backup
            backup_path = img_path + ".backup"
            if not os.path.exists(backup_path):
                import shutil
                shutil.copy2(img_path, backup_path)
                print(f"Created backup: {backup_path}")
            
            # Compress
            original, compressed, reduction = compress_image(
                img_path, 
                img_path, 
                quality=85,
                max_size=(800, 800)
            )
            
            if original and compressed:
                print(f"{filename:20s} {original:8.1f} KB -> {compressed:8.1f} KB ({reduction:5.1f}% smaller)")
        
        print("-" * 60)
        print()
    
    print("=" * 60)
    print("Compression complete!")
    print("=" * 60)
    print()
    print("Note: Original images backed up as .backup files")
    print("If you're happy with the results, you can delete the .backup files")
    print("If something went wrong, restore from .backup files")

if __name__ == "__main__":
    main()
