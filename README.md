# 🏢 نظام إدارة سكان العمارة السكنية

## Residential Tower Management System

A modern, responsive web application for managing residents in residential buildings. Built with React, featuring Arabic language support, local storage persistence, and PDF export functionality.

![React](https://img.shields.io/badge/React-19.1.0-blue)
![Vite](https://img.shields.io/badge/Vite-6.3.5-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.10-cyan)
![DaisyUI](https://img.shields.io/badge/DaisyUI-5.0.43-orange)

## ✨ Features

### 🏠 **Resident Management**

- Add new residents with comprehensive information
- Edit existing resident details
- Delete residents with confirmation
- Real-time form validation with Arabic error messages

### 📊 **Dashboard & Statistics**

- Real-time statistics dashboard
- Total residents count
- Occupied apartments tracking
- Last update timestamp

### 💾 **Data Persistence**

- Automatic local storage saving
- Data survives browser refresh and restart
- Robust error handling and data validation
- Debug tools for troubleshooting

### 📄 **PDF Export**

- Generate professional PDF reports
- Arabic text support with proper RTL layout
- Beautiful table formatting
- Export date and statistics included

### 🎨 **Modern UI/UX**

- Responsive design for all devices
- Beautiful gradient backgrounds
- Smooth animations and transitions
- Professional color scheme
- Arabic language interface

### 📱 **Responsive Design**

- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface
- Adaptive layouts

## 🚀 Quick Start

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Ali-Tharwat-181/Residential-Tower-Management.git
   cd Residential-Tower-Management
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📖 Usage Guide

### Adding a New Resident

1. Fill in the resident's full name (Arabic characters only)
2. Enter the phone number (must start with 010)
3. Select the floor from the dropdown
4. Enter the apartment number
5. Add optional notes
6. Click "إضافة الساكن" (Add Resident)

### Editing a Resident

1. Click the "تعديل" (Edit) button next to any resident
2. Modify the information in the form
3. Click "تحديث" (Update) to save changes
4. Click "إلغاء" (Cancel) to discard changes

### Exporting to PDF

1. Ensure you have residents in the list
2. Click "تصدير إلى PDF" (Export to PDF)
3. The PDF will be automatically downloaded
4. The file will be named "قائمة_السكان.pdf"

### Managing Data

- **Clear All Data**: Click "حذف جميع البيانات" to remove all residents
- **Debug Data**: Click "تحقق من البيانات" to check localStorage status
- **Data Persistence**: All data is automatically saved and restored

## 🛠️ Technical Stack

### Frontend

- **React 19.1.0** - Modern React with latest features
- **Vite 6.3.5** - Fast build tool and development server
- **Tailwind CSS 4.1.10** - Utility-first CSS framework
- **DaisyUI 5.0.43** - Component library for Tailwind CSS

### Form Handling

- **React Hook Form 7.58.1** - Performant forms with minimal re-renders
- **Zod 3.25.67** - TypeScript-first schema validation
- **@hookform/resolvers 5.1.1** - Integration between React Hook Form and Zod

### PDF Generation

- **html2pdf.js 0.9.0** - Client-side PDF generation with Arabic support

### Development Tools

- **ESLint 9.25.0** - Code linting and formatting
- **TypeScript** - Type safety and better development experience

## 📁 Project Structure

```
Residential-Tower-Management/
├── public/                 # Static assets
├── src/
│   ├── App.jsx            # Main application component
│   ├── index.css          # Global styles
│   └── main.jsx           # Application entry point
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── eslint.config.js       # ESLint configuration
└── README.md              # This file
```

## 🎯 Key Features Explained

### Local Storage Implementation

The application uses a custom `useLocalStorage` hook that:

- Automatically saves data when residents are added/edited/deleted
- Loads data on application startup
- Handles errors gracefully with fallback to initial values
- Provides detailed console logging for debugging

### Form Validation

Comprehensive validation rules:

- **Name**: Minimum 2 characters, Arabic characters only
- **Phone**: Exactly 11 digits, must start with "010"
- **Floor**: Must be selected from dropdown
- **Apartment**: Number between 1-500
- **Notes**: Optional field

### Responsive Design

- **Mobile**: Single column layout with stacked elements
- **Tablet**: Two-column form layout
- **Desktop**: Full layout with all features visible
- **Touch-friendly**: Large buttons and touch targets

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ali Tharwat**

- GitHub: [@Ali-Tharwat-181](https://github.com/Ali-Tharwat-181)

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite team for the fast build tool
- Tailwind CSS team for the utility-first CSS framework
- DaisyUI team for the beautiful component library
- All contributors and users of this project

## 📞 Support

If you have any questions or need support, please:

1. Check the [Issues](https://github.com/Ali-Tharwat-181/Residential-Tower-Management/issues) page
2. Create a new issue if your problem isn't already addressed
3. Contact the maintainer for urgent issues

---

⭐ **Star this repository if you find it helpful!**
