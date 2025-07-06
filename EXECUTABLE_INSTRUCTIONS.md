# 🚀 Yellowpages Scraper - Windows Executables Guide

## 📦 Available Executables

Your Yellowpages Scraper application has been successfully compiled into Windows executables. You now have **two different versions** to choose from:

### 1. 🖥️ **GUI Application (Recommended)**
**File:** `dist/Yellowpages Scraper Setup 1.0.0.exe` (73MB)

**Features:**
- ✅ **Full GUI Interface** with modern design
- ✅ **Easy Installation** with Windows installer
- ✅ **Desktop Shortcut** and Start Menu integration
- ✅ **Professional Appearance** like native Windows apps
- ✅ **Auto-updates** capability
- ✅ **Uninstall** through Windows Control Panel

**Installation:**
1. Double-click `Yellowpages Scraper Setup 1.0.0.exe`
2. Follow the installation wizard
3. Choose installation directory (optional)
4. Launch from Start Menu or Desktop shortcut

### 2. 💻 **Portable Command-Line Version**
**File:** `yellowpages-scraper-portable.exe` (529MB)

**Features:**
- ✅ **No Installation Required** - runs directly
- ✅ **Portable** - can be moved to any folder
- ✅ **Command-Line Interface** for automation
- ✅ **Self-contained** - includes all dependencies
- ✅ **Batch Processing** capabilities

**Usage:**
```bash
# Basic usage
yellowpages-scraper-portable.exe

# With parameters
yellowpages-scraper-portable.exe --category "Restaurants" --zipcode "20852"
```

## 🎯 **Which Version Should You Use?**

### **Choose GUI Version If:**
- You prefer visual interfaces
- You want easy installation/uninstallation
- You're doing occasional scraping
- You want professional Windows integration
- You prefer point-and-click operation

### **Choose Portable Version If:**
- You need to run without installation
- You want to automate with scripts
- You're doing batch processing
- You need to move between computers
- You prefer command-line control

## 🔧 **System Requirements**

### **Minimum Requirements:**
- **OS:** Windows 10 (64-bit) or later
- **RAM:** 4GB (8GB recommended)
- **Storage:** 1GB free space
- **Internet:** Required for scraping

### **Recommended Requirements:**
- **OS:** Windows 11 (64-bit)
- **RAM:** 8GB or more
- **Storage:** 2GB free space
- **Internet:** High-speed connection

## 📋 **Installation Instructions**

### **GUI Version Installation:**

1. **Download the Installer**
   - Navigate to the `dist` folder
   - Find `Yellowpages Scraper Setup 1.0.0.exe`

2. **Run the Installer**
   - Double-click the installer
   - If Windows SmartScreen appears, click "More info" → "Run anyway"

3. **Follow Installation Wizard**
   - Accept the license agreement
   - Choose installation directory (default: `C:\Users\[YourName]\AppData\Local\Programs\yellowpages-scraper`)
   - Click "Install"

4. **Launch the Application**
   - Find "Yellowpages Scraper" in Start Menu
   - Or use the Desktop shortcut
   - Or run from: `C:\Users\[YourName]\AppData\Local\Programs\yellowpages-scraper\Yellowpages Scraper.exe`

### **Portable Version Usage:**

1. **Copy the Executable**
   - Copy `yellowpages-scraper-portable.exe` to any folder
   - No installation required

2. **Run the Application**
   - Double-click the executable
   - Or run from command line with parameters

3. **Command Line Options**
   ```bash
   # Interactive mode
   yellowpages-scraper-portable.exe

   # Direct mode with parameters
   yellowpages-scraper-portable.exe --category "Restaurants" --zipcode "20852" --parallel 5
   ```

## 🛠️ **Troubleshooting**

### **Common Issues:**

#### **"Windows protected your PC" Error**
- Click "More info"
- Click "Run anyway"
- This is normal for unsigned executables

#### **"Application not found" Error**
- Ensure you're running the correct executable
- Check if antivirus is blocking the file
- Try running as Administrator

#### **"Missing DLL" Error**
- Install Visual C++ Redistributable
- Download from Microsoft's official website

#### **"Chrome not found" Error (Portable Version)**
- The portable version includes Chromium
- Ensure the executable has write permissions to create temporary files

### **Performance Issues:**

#### **Slow Scraping**
- Increase parallel pages (up to 20)
- Close other applications
- Check internet connection speed

#### **High Memory Usage**
- Reduce parallel pages
- Close other browser tabs
- Restart the application periodically

## 🔄 **Updates and Maintenance**

### **GUI Version Updates:**
- Uninstall current version
- Download new installer
- Install new version
- Your data folders will be preserved

### **Portable Version Updates:**
- Replace the executable file
- Keep your data folders
- No reinstallation needed

## 📁 **Data Storage**

### **GUI Version:**
- **Installation:** `C:\Users\[YourName]\AppData\Local\Programs\yellowpages-scraper\`
- **Data:** `C:\Users\[YourName]\AppData\Roaming\yellowpages-scraper\`
- **Projects:** Created in the same directory as the executable

### **Portable Version:**
- **Executable:** Wherever you place the .exe file
- **Data:** Same directory as the executable
- **Projects:** Created in subdirectories

## 🎉 **Getting Started**

1. **Launch the Application** (GUI or Portable)
2. **Select Business Category** from the dropdown
3. **Enter Zip Code** for your target area
4. **Configure Options** (photos, reviews, etc.)
5. **Set Parallel Pages** (1-20, higher = faster)
6. **Click "Start Scraping"**
7. **Monitor Progress** in the activity log
8. **View Results** in the statistics panel
9. **Open Project Folder** to access CSV files

## 📞 **Support**

If you encounter any issues:

1. **Check the Activity Log** for error messages
2. **Review System Requirements** above
3. **Try Running as Administrator**
4. **Check Antivirus Settings**
5. **Ensure Internet Connection**

## 🏆 **Success!**

You now have a fully functional Windows executable of the Yellowpages Scraper! Choose the version that best fits your needs and start extracting business data efficiently.

---

**Note:** Both executables are self-contained and include all necessary dependencies. No additional software installation is required beyond Windows itself. 