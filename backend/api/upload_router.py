import sys
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query, BackgroundTasks
from database.db import SessionLocal, Document, Category
from datetime import datetime
import os
from pathlib import Path
import shutil

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from utils.convert_markdown import convert_to_markdown_single

router = APIRouter(prefix="/api", tags=["upload"])

@router.post("/upload")
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: str = Form(...),
    categoryId: str = Form(...)
):
    db = SessionLocal()
    try:
        # Validate file type
        allowed_types = [
            "application/pdf",           # PDF
            "application/msword",        # DOC
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  # DOCX
            "application/vnd.ms-excel",  # XLS
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",  # XLSX
            "application/vnd.ms-powerpoint",  # PPT
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"  # PPTX
        ]
        
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX"
            )

        # Retrieve category name from database
        category = db.query(Category).filter(Category.id == int(categoryId)).first()
        
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        
        category_name = category.name
        
        # Create uploads directory structure
        uploads_dir = Path("uploads")
        category_dir = uploads_dir / category_name
        category_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename to prevent conflicts
        unique_filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}"
        file_path = category_dir / unique_filename
        
        # Save file to the specified location
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Create document record in database
        document = Document(
            title=title,
            categoryId=categoryId,
            fileName=unique_filename
        )
        
        db.add(document)
        db.commit()
        db.refresh(document)
         
        # Convert to markdown
        # Run conversion in the background
        background_tasks.add_task(convert_to_markdown_single, str(file_path))


        return {
            "message": "File uploaded successfully",
            "document_id": document.id,
            "file_path": str(file_path),
            "category": category_name
        }
   
        
    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    finally:
        db.close()


@router.get("/categories")
async def get_categories():
    db = SessionLocal()
    try:
        categories = db.query(Category).all()
        return [{"id": cat.id, "name": cat.name} for cat in categories]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not fetch categories: {str(e)}")
    finally:
        db.close()


@router.get("/uploaded-files")
async def get_uploaded_files(
    category_id: str = Query(None, description="Filter by category ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100)
):
    db = SessionLocal()
    try:
        query = db.query(Document).order_by(Document.createdAt.desc())
        
        if category_id:
            query = query.filter(Document.categoryId == category_id)
        
        documents = query.offset(skip).limit(limit).all()
        
        result = []
        for doc in documents:
            # Get category name
            category = db.query(Category).filter(Category.id == doc.categoryId).first()
            category_name = category.name if category else "Unknown Category"
            
            # Construct file path
            file_path = Path("uploads") / category_name / doc.fileName
            
            result.append({
                "id": doc.id,
                "title": doc.title,
                "categoryId": doc.categoryId,
                "categoryName": category_name,
                "fileName": doc.fileName.split("_")[1],
                "filePath": str(file_path),
                "createdAt": doc.createdAt,
                "updatedAt": doc.updatedAt,
                "fileUrl": f"http://127.0.0.1:8000/{file_path}"  # URL to access the file
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not fetch files: {str(e)}")
    finally:
        db.close()


@router.delete("/uploaded-files/{document_id}")
async def delete_uploaded_file(document_id: int):
    db = SessionLocal()
    try:
        # Get the document
        document = db.query(Document).filter(Document.id == document_id).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Get category name to construct file path
        category = db.query(Category).filter(Category.id == document.categoryId).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found for document")
        
        # Delete the physical file
        file_path = Path("uploads") / category.name / document.fileName
        if file_path.exists():
            file_path.unlink()
        
        # Delete the document record
        db.delete(document)
        db.commit()
        
        return {"message": "File deleted successfully"}
    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")
    finally:
        db.close()


@router.put("/uploaded-files/{document_id}/replace")
async def replace_uploaded_file(
    document_id: int,
    file: UploadFile = File(...),
    title: str = Form(...),
    categoryId: str = Form(...)
):
    db = SessionLocal()
    try:
        # Get the existing document
        document = db.query(Document).filter(Document.id == document_id).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Validate file type
        allowed_types = [
            "application/pdf",           # PDF
            "application/msword",        # DOC
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  # DOCX
            "application/vnd.ms-excel",  # XLS
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",  # XLSX
            "application/vnd.ms-powerpoint",  # PPT
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"  # PPTX
        ]
        
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX"
            )

        # Get old category name to locate the old file
        old_category = db.query(Category).filter(Category.id == document.categoryId).first()
        if not old_category:
            raise HTTPException(status_code=404, detail="Old category not found")
        
        # Delete the old file
        old_file_path = Path("uploads") / old_category.name / document.fileName
        if old_file_path.exists():
            old_file_path.unlink()
        
        # Get new category name
        new_category = db.query(Category).filter(Category.id == int(categoryId)).first()
        if not new_category:
            raise HTTPException(status_code=404, detail="New category not found")
        
        # Create uploads directory structure for new category
        uploads_dir = Path("uploads")
        category_dir = uploads_dir / new_category.name
        category_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename to prevent conflicts
        unique_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
        file_path = category_dir / unique_filename
        
        # Save new file to the specified location
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Update document record
        document.title = title
        document.categoryId = categoryId
        document.fileName = unique_filename
        document.updatedAt = datetime.utcnow()
        
        db.commit()
        db.refresh(document)
        
        return {
            "message": "File replaced successfully",
            "document_id": document.id,
            "file_path": str(file_path),
            "category": new_category.name
        }
        
    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Replace failed: {str(e)}")
    finally:
        db.close()


# Add a file serving endpoint
@router.get("/files/{category_id}/{filename}")
async def serve_file(category_id: str, filename: str):
    # Get category name from DB
    db = SessionLocal()
    try:
        category = db.query(Category).filter(Category.id == int(category_id)).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
    finally:
        db.close()
    
    file_path = Path("uploads") / category.name / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    # Return file as download
    from fastapi.responses import FileResponse
    return FileResponse(path=file_path, media_type="application/octet-stream", filename=filename)