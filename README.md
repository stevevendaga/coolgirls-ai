# CoolGirls AI Assistant

**CoolGirls AI** is an innovative assistant platform designed specifically for the Cool Girls Program focused on HIV prevention and support for adolescent girls and young women (AGYW) aged 15-24. The platform combines a sophisticated AI-powered backend with a user-friendly React frontend to provide personalized assistance and information on sexual and reproductive health, HIV prevention, and related topics.

## 🚀 Features

### Frontend (Next.js)
- **Authentication**: Secure user registration and login using Clerk
- **Dashboard**: User dashboard with quick access to core features
- **Chat Interface**: Real-time AI-powered conversations with personalized responses
- **Document Upload**: Secure file upload functionality with categorization
- **Embeddable Widget**: Customizable AI assistant widget that can be embedded on external websites
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

### Backend (FastAPI)
- **AI-Powered Chat**: Advanced RAG (Retrieval Augmented Generation) system using vector databases
- **Document Processing**: Support for uploading and processing various file formats (PDF, DOCX, PPT, XLS, etc.)
- **Vector Storage**: Semantic search and retrieval using ChromaDB
- **Safety Filters**: Content moderation with sensitive keyword detection
- **Session Management**: Conversation history persistence
- **Multi-language Support**: Flexible language configuration

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16
- **Authentication**: Clerk
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Package Manager**: npm/yarn

### Backend
- **Framework**: FastAPI
- **Language Model**: OpenAI-compatible (with `gpt-4.1-nano` as default)
- **Vector Database**: ChromaDB
- **Embeddings**: OpenAI/Hugging Face
- **Document Processing**: LangChain, MarkItDown
- **Database**: SQLite (with MySQL option)
- **Security**: Clerk authentication

## 📁 Project Structure

```
coolgirls-ai/
├── frontend/               # Next.js frontend application
│   ├── app/               # Next.js 13+ app directory
│   │   ├── chat/          # Chat interface
│   │   ├── dashboard/     # Dashboard with subpages
│   │   │   ├── upload/    # File upload interface
│   │   │   ├── embed/     # Widget embedding tool
│   │   │   └── settings/  # Settings page
│   │   ├── landing/       # Landing page
│   │   └── globals.css    # Global styles
│   ├── components/        # React components
│   └── public/            # Static assets
└── coolgirls-ai-backend/  # FastAPI backend
    ├── api/               # API routes
    ├── core/              # Core functionality (prompts, safety filters)
    ├── database/          # Database models and connections
    ├── uploads/           # Uploaded documents storage
    ├── utils/             # Utility functions (RAG, chunking, etc.)
    └── main.py            # Main application entry point
```

## 🔧 Installation

### Prerequisites
- Node.js (v18 or higher)
- Python 3.9+
- pip

### Frontend Setup
1. Navigate to the frontend directory:

   ```bash
   cd coolgirls-ai/frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file with the following:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   ```

### Backend Setup
1. Navigate to the backend directory:

   ```bash
   cd coolgirls-ai/coolgirls-ai-backend
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file with the following:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   HF_TOKEN=your_huggingface_token_here
   CORS_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

4. Run the backend server:

   ```bash
   uvicorn main:app --reload
   ```

## 🚀 Running the Application

1. Start the backend:

   ```bash
   cd coolgirls-ai/coolgirls-ai-backend
   uvicorn main:app --reload
   ```

2. In a separate terminal, start the frontend:

   ```bash
   cd coolgirls-ai/frontend
   npm run dev
   ```

3. Visit `http://localhost:3000` to access the application.

## 📖 Usage

### Chat Interface
- Access the chat feature through the dashboard or main navigation
- Type questions about sexual and reproductive health, HIV prevention, or other related topics
- Receive personalized, context-aware responses from the AI assistant

### Document Upload
1. Go to the dashboard upload section
2. Select a category for your document
3. Upload supported file formats (PDF, DOCX, PPT, XLS, etc.)
4. The system will automatically process and index the content for retrieval

### Embedding the Widget
- Customize the AI assistant widget appearance in the dashboard
- Copy the generated embed code
- Paste it into external websites to provide CoolGirls AI assistance

## 🔐 Authentication

The application uses Clerk for secure authentication. Users must register and sign in to access the dashboard and full features.

## 💡 Safety Features
- Content filtering for sensitive topics
- Automatic detection of potentially harmful queries
- Referral system for sensitive topics to connect with human mentors
- Age-appropriate language enforcement

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request
