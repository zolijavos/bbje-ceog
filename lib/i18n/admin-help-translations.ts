/**
 * Admin Help Page Translations
 * Contains all guide content in English and Hungarian
 */

export interface GuideItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

export const adminHelpTranslations = {
  en: {
    // Page Header
    pageTitle: 'Admin User Guide',
    pageDescription: 'Detailed guide to using the CEO Gala 2026 admin interface',

    // Search
    searchPlaceholder: 'Search the guide... (e.g., guest, payment, email)',

    // Filter buttons
    all: 'All',

    // Results header
    searchResults: 'Search results',
    allGuides: 'All guides',

    // Expand/collapse
    expandAll: 'Expand all',
    collapseAll: 'Collapse all',

    // No results
    noResults: 'No results found. Try a different search term or browse by category.',

    // Support section
    needHelp: 'Need technical assistance?',
    contactAdmin: 'If you cannot find the answer to your question, contact the system administrator',

    // Guide count suffix
    guides: 'guides',

    // Categories
    categories: {
      'Guest List': 'Guest List',
      'CSV Import': 'CSV Import',
      'Applications': 'Applications',
      'Seating Arrangement': 'Seating Arrangement',
      'Table Management': 'Table Management',
      'Check-in': 'Check-in',
      'Payment History': 'Payment History',
      'Email Templates': 'Email Templates',
      'Scheduled Emails': 'Scheduled Emails',
      'Statistics': 'Statistics',
      'Email Logs': 'Email Logs',
      'User Management': 'User Management',
      'System & Technical': 'System & Technical',
    },
  },
  hu: {
    // Page Header
    pageTitle: 'Admin Felhasználói Útmutató',
    pageDescription: 'Részletes útmutató a CEO Gala 2026 admin felület használatához',

    // Search
    searchPlaceholder: 'Keresés az útmutatóban... (pl. vendég, fizetés, email)',

    // Filter buttons
    all: 'Összes',

    // Results header
    searchResults: 'Keresési találatok',
    allGuides: 'Összes útmutató',

    // Expand/collapse
    expandAll: 'Mind kinyit',
    collapseAll: 'Mind becsuk',

    // No results
    noResults: 'Nincs találat. Próbálj más keresőszót vagy böngéssz kategóriák szerint.',

    // Support section
    needHelp: 'Technikai segítségre van szükséged?',
    contactAdmin: 'Ha nem találod a választ a kérdésedre, keresd a rendszergazdát',

    // Guide count suffix
    guides: 'útmutató',

    // Categories
    categories: {
      'Guest List': 'Vendéglista',
      'CSV Import': 'CSV Import',
      'Applications': 'Jelentkezések',
      'Seating Arrangement': 'Ültetési rend',
      'Table Management': 'Asztalkezelés',
      'Check-in': 'Beléptetés',
      'Payment History': 'Fizetési előzmények',
      'Email Templates': 'Email sablonok',
      'Scheduled Emails': 'Ütemezett emailek',
      'Statistics': 'Statisztikák',
      'Email Logs': 'Email napló',
      'User Management': 'Felhasználó kezelés',
      'System & Technical': 'Rendszer és technikai',
    },
  },
};

// Guide content - English version
export const adminGuidesEn: GuideItem[] = [
  // ==========================================
  // GUEST LIST - /admin/guests
  // ==========================================
  {
    id: 'gl-overview',
    category: 'Guest List',
    question: 'How does the guest list work?',
    answer: `The guest list is the central management interface for all invited and registered guests. Here you can see:

• **Guest data**: Name, email, address, guest type (VIP, Paying Single, Paying Paired)
• **Status**: Invited, Registered, Approved, Declined, Pending Approval
• **Payment status**: Pending, Paid, Failed (for paying guests)
• **Table assignment**: Which table the guest is seated at
• **Email sending**: How many magic links you have sent

The list can be filtered by guest type, status, and table assignment. Use the search bar to find guests by name or email.`,
    keywords: ['guest', 'list', 'overview', 'introduction'],
  },
  {
    id: 'gl-add',
    category: 'Guest List',
    question: 'How do I add a new guest?',
    answer: `1. Click the **"+ Add Guest"** button above the list
2. Fill out the form:
   • **Name**: Guest's full name (required)
   • **Email**: Email address - must be unique (required)
   • **Title**: Salutation (Mr., Ms., Dr., etc.)
   • **Guest Type**: VIP (free), Paying Single (1 ticket), Paying Paired (2 tickets)
   • **Dietary Requirements**: Dietary needs (vegetarian, vegan, gluten-free, etc.)
   • **Seating Preferences**: Seating preferences
3. Click the **"Save"** button

The guest will be added with "Invited" status. To send a magic link, select them and click "Send Email".`,
    keywords: ['add', 'new', 'guest', 'create'],
  },
  {
    id: 'gl-edit',
    category: 'Guest List',
    question: 'How do I edit a guest?',
    answer: `1. Find the guest in the list
2. Click the **pencil icon** in the guest's row
3. Modify the desired fields
4. Click the **"Save Changes"** button

**Important**: If the guest has already registered, the email address cannot be changed. Dietary requirements and seating preferences can be changed at any time.`,
    keywords: ['edit', 'modify', 'update', 'change'],
  },
  {
    id: 'gl-delete',
    category: 'Guest List',
    question: 'How do I delete a guest?',
    answer: `1. Find the guest in the list
2. Click the **trash icon**
3. Confirm the deletion in the popup

**Warning**: Deletion is permanent! All related data will be deleted:
• Registration
• Payment data
• Table assignment
• Email log

Instead of deleting, consider setting the guest to "Declined" status.`,
    keywords: ['delete', 'remove', 'guest'],
  },
  {
    id: 'gl-filter',
    category: 'Guest List',
    question: 'How do I filter the guest list?',
    answer: `Filters at the top of the list:

**By guest type**:
• All Types - All guests
• VIP - Free VIP guests
• Paying Single - Single ticket paying guests
• Paying Paired - Paired ticket paying guests

**By status**:
• All Statuses - All statuses
• Invited - Invited, not yet registered
• Registered - Registered, awaiting payment
• Approved - Approved, ticket issued
• Declined - Declined

**By table**:
• All Tables - All guests
• Unassigned - No table assigned
• [Table names] - Guests assigned to specific tables

The **search box** filters by name or email.`,
    keywords: ['filter', 'search', 'type', 'status'],
  },
  {
    id: 'gl-magic-link',
    category: 'Guest List',
    question: 'How do I send a magic link invitation?',
    answer: `**Individual sending**:
1. Click the **envelope icon** in the guest's row
2. Review the email preview
3. Click the **"Send"** button

**Bulk sending**:
1. Select guests using checkboxes
2. Click the **"Send Email"** button
3. Review recipients in the preview
4. Click the **"Send to X recipients"** button

**Important notes**:
• The magic link is valid for 24 hours after first click
• Multiple links can be sent to a guest (old one becomes invalid)
• The number of sent emails is visible for each guest`,
    keywords: ['magic link', 'invitation', 'email', 'send'],
  },
  {
    id: 'gl-payment-approve',
    category: 'Guest List',
    question: 'How do I approve a bank transfer?',
    answer: `If a guest chose bank transfer as payment method:

1. Find the guest - with "Pending" payment status
2. Check your bank statement to confirm the transfer arrived
3. Click the **"Approve"** button in the guest's row
4. Confirm the approval

**After approval**:
• Guest status becomes "Approved"
• QR code e-ticket is automatically generated
• E-ticket is sent by email
• Guest can access the PWA app

**Tip**: On the Statistics page you can see all pending payments.`,
    keywords: ['approve', 'bank transfer', 'payment', 'confirm'],
  },
  {
    id: 'gl-bulk',
    category: 'Guest List',
    question: 'How do I perform bulk operations?',
    answer: `**Selecting guests**:
• Click the checkbox for each guest individually
• Or use the header checkbox to select all

**Available bulk operations**:
1. **Send Email** - Send magic link to selected guests
2. **Delete** - Delete selected guests (confirmation required)

The number of selected guests is shown next to the action buttons.`,
    keywords: ['bulk', 'select', 'multiple', 'batch'],
  },

  // ==========================================
  // CSV IMPORT
  // ==========================================
  {
    id: 'csv-overview',
    category: 'CSV Import',
    question: 'How does CSV import work?',
    answer: `CSV import allows bulk uploading of guests from a file.

**Supported format**: CSV (comma-separated values)

**Required columns**:
• \`email\` - Guest email address (must be unique)
• \`name\` - Guest full name
• \`guest_type\` - Type: vip, paying_single, or paying_paired

**Optional columns**:
• \`title\` - Salutation (Mr., Ms., Dr.)
• \`phone\` - Phone number
• \`company\` - Company name
• \`position\` - Position
• \`dietary_requirements\` - Dietary needs
• \`seating_preferences\` - Seating preferences`,
    keywords: ['csv', 'import', 'upload', 'bulk'],
  },
  {
    id: 'csv-format',
    category: 'CSV Import',
    question: 'What format should the CSV file be?',
    answer: `**Example CSV file content**:
\`\`\`
email,name,guest_type,title,company
john@example.com,John Doe,vip,Mr.,Acme Inc.
jane@example.com,Jane Smith,paying_single,Ms.,Tech Corp
bob@example.com,Bob Wilson,paying_paired,Dr.,Health Ltd.
\`\`\`

**Rules**:
• First row must be header with column names
• Email must be unique - duplicates will be skipped
• Guest type values: \`vip\`, \`paying_single\`, \`paying_paired\`
• UTF-8 encoding recommended for special characters
• Use quotes if value contains comma`,
    keywords: ['format', 'column', 'example', 'template'],
  },
  {
    id: 'csv-upload',
    category: 'CSV Import',
    question: 'How do I upload a CSV file?',
    answer: `1. Go to **Guest List** → **"CSV Import"** button
2. **Drag the file** to the designated area, or click to browse
3. The system shows a **preview** of the parsed data
4. Review the data - errors appear in red
5. Click the **"Import"** button

**Import results**:
• Successful: How many guests were imported
• Skipped: Duplicate email addresses
• Error: Details of rows with invalid format

Imported guests are added with "Invited" status.`,
    keywords: ['upload', 'drag', 'drop', 'file'],
  },
  {
    id: 'csv-errors',
    category: 'CSV Import',
    question: 'What should I do if I get errors during import?',
    answer: `**Common errors and solutions**:

**"Invalid guest_type"**:
• Check that exactly \`vip\`, \`paying_single\` or \`paying_paired\` is used

**"Email already exists"**:
• This guest is already in the system - will be skipped

**"Missing required field"**:
• Missing email, name or guest_type column

**"Invalid email format"**:
• Email address format is incorrect

**Fix steps**:
1. Download the error report
2. Fix the incorrect rows in the CSV
3. Upload again only the fixed rows`,
    keywords: ['error', 'fix', 'problem', 'solution'],
  },

  // ==========================================
  // APPLICATIONS
  // ==========================================
  {
    id: 'app-overview',
    category: 'Applications',
    question: 'How does application management work?',
    answer: `Non-invited guests can apply through the public **/apply** page.

**Application process**:
1. Guest fills out the application form
2. Application arrives with "Pending Approval" status
3. Admin reviews the application
4. Approval → Magic link sent (72-hour validity)
5. Rejection → Notification with reason

**On the Applications page you can see**:
• Number of pending applications
• All applications
• Filter by status (Pending, Rejected)`,
    keywords: ['application', 'apply', 'pending', 'review'],
  },
  {
    id: 'app-approve',
    category: 'Applications',
    question: 'How do I approve an application?',
    answer: `1. Go to the **Applications** page
2. Click the **eye icon** to view applicant details
3. Review the data:
   • Name, email, company, position
   • Dietary requirements
   • Seating preferences
4. Click the **green "Approve"** button

**After approval**:
• Guest becomes "paying_single" type
• 72-hour magic link is generated and sent
• Guest can register and pay`,
    keywords: ['approve', 'accept', 'confirm'],
  },
  {
    id: 'app-reject',
    category: 'Applications',
    question: 'How do I reject an application?',
    answer: `1. Go to the **Applications** page
2. Click the **red "Reject"** button
3. In the popup, **enter the rejection reason**
4. Click the **"Confirm Rejection"** button

**After rejection**:
• Applicant receives email notification
• Status becomes "Rejected"
• Reason is visible in the system

**Tip**: Rejected applications cannot be deleted - this is for audit purposes.`,
    keywords: ['reject', 'deny', 'decline'],
  },

  // ==========================================
  // SEATING ARRANGEMENT
  // ==========================================
  {
    id: 'seat-overview',
    category: 'Seating Arrangement',
    question: 'How does the seating arrangement work?',
    answer: `The seating page provides an interactive drag & drop interface.

**Two views available**:
1. **Grid view**: Card display, by table
2. **Floor Plan view**: 2D map with round tables

**Features**:
• Drag guests to tables
• Move guests between tables
• Remove guests from tables
• Statistics: occupancy, assigned/unassigned guests

**Color codes** (Floor Plan):
• Green: Has free seats
• Yellow: Partially occupied
• Red: Full`,
    keywords: ['seating', 'table', 'drag', 'drop', 'arrangement'],
  },
  {
    id: 'seat-assign',
    category: 'Seating Arrangement',
    question: 'How do I assign a guest to a table?',
    answer: `**In Grid view**:
1. On the left panel you see **unassigned guests**
2. Grab the guest card
3. Drag it to the desired table area
4. Release - guest is assigned

**In Floor Plan view**:
1. Select the guest from the left panel
2. Drag to the round table icon
3. Release at the target

**Paired tickets**: Paying_paired guests automatically take 2 seats!`,
    keywords: ['assign', 'table', 'seat', 'drag'],
  },
  {
    id: 'seat-remove',
    category: 'Seating Arrangement',
    question: 'How do I remove a guest from a table?',
    answer: `**In Grid view**:
1. Click the **"X" button** next to the guest on the table card
2. Guest returns to the unassigned panel

**In Floor Plan view**:
1. Click the table to show details
2. Click the **"X" button** next to the guest

**With drag & drop**:
Drag the guest back to the left panel.`,
    keywords: ['remove', 'unassign', 'delete'],
  },
  {
    id: 'seat-move',
    category: 'Seating Arrangement',
    question: 'How do I move a guest to another table?',
    answer: `Simply **drag the guest from one table to another**.

The system automatically:
1. Removes from the old table
2. Assigns to the new table

**Note**:
• Check if there is free space at the target table
• For paired tickets, 2 free seats are needed`,
    keywords: ['move', 'transfer', 'another table'],
  },
  {
    id: 'seat-csv',
    category: 'Seating Arrangement',
    question: 'How do I import seating from CSV?',
    answer: `1. Click the **"Import CSV"** button
2. CSV format:
\`\`\`
guest_email,table_name
john@example.com,VIP Table 1
jane@example.com,Table 5
\`\`\`
3. Paste into the text box
4. Click the **"Import"** button

**Result**:
• Number of successful assignments
• Error details (e.g., non-existent table)`,
    keywords: ['import', 'csv', 'bulk', 'assignment'],
  },
  {
    id: 'seat-export',
    category: 'Seating Arrangement',
    question: 'How do I export the seating arrangement?',
    answer: `1. Click the **"Export"** button
2. The CSV file downloads automatically

**File contents**:
• Table name
• Guest name
• Guest email
• Seat number
• Guest type

This is useful for printing or sending to the event venue.`,
    keywords: ['export', 'download', 'csv', 'save'],
  },

  // ==========================================
  // TABLE MANAGEMENT
  // ==========================================
  {
    id: 'table-overview',
    category: 'Table Management',
    question: 'How do I manage tables?',
    answer: `Access the table manager via **Seating** → **"Manage Tables"** link.

**Here you can see**:
• List of all tables
• Capacity and occupancy
• Table type (Standard, VIP, Reserved)
• List of assigned guests

**Operations**:
• Create new table
• Edit existing table
• Delete table (only if empty)`,
    keywords: ['table', 'management', 'overview'],
  },
  {
    id: 'table-create',
    category: 'Table Management',
    question: 'How do I create a new table?',
    answer: `1. Click the **"+ Add Table"** button
2. Fill out the form:
   • **Name**: Table name (e.g., "VIP Table 1", "Table 5")
   • **Capacity**: Number of seats (1-20)
   • **Type**: Standard, VIP, or Reserved
3. Click the **"Create"** button

The new table appears in the list and on the seating map.`,
    keywords: ['create', 'new', 'table', 'add'],
  },
  {
    id: 'table-edit',
    category: 'Table Management',
    question: 'How do I edit a table?',
    answer: `1. Click the **pencil icon** in the table row
2. Modify:
   • Name
   • Capacity (cannot be less than current occupancy!)
   • Type
3. Click the **"Save"** button

**Note**: If you reduce capacity, you must remove guests first.`,
    keywords: ['edit', 'modify', 'update'],
  },
  {
    id: 'table-delete',
    category: 'Table Management',
    question: 'How do I delete a table?',
    answer: `1. Click the **trash icon** in the table row
2. Confirm the deletion

**Only empty tables can be deleted!**

If there are assigned guests:
1. Go to the seating page
2. Move guests to another table
3. Return and delete the table`,
    keywords: ['delete', 'remove', 'table'],
  },

  // ==========================================
  // CHECK-IN
  // ==========================================
  {
    id: 'checkin-overview',
    category: 'Check-in',
    question: 'How does the check-in system work?',
    answer: `Check-in is the guest entry system on event day.

**Check-in modes**:
1. **QR code scanning**: Guest shows their e-ticket
2. **Manual search**: By name or email

**Check-in Log page shows**:
• Aggregated statistics
• All check-in events in chronological order
• Search and filter by date

**Color codes** for scanning:
• Green: Valid ticket → "Check In" button
• Yellow: Already checked in → "Override" option
• Red: Invalid/expired ticket → Error`,
    keywords: ['check-in', 'entry', 'qr', 'scan'],
  },
  {
    id: 'checkin-scan',
    category: 'Check-in',
    question: 'How do I scan a QR code?',
    answer: `1. Go to the **/checkin** page (mobile optimized)
2. Allow camera access
3. Hold the guest's QR code in front of the camera
4. The system automatically reads it

**After successful scan**:
• Guest name and type appear
• Click the **"Check In"** button
• Guest entry is recorded

**Staff users** only see the check-in function.`,
    keywords: ['scan', 'qr', 'camera', 'read'],
  },
  {
    id: 'checkin-manual',
    category: 'Check-in',
    question: 'What if the QR code does not work?',
    answer: `If scanning fails, use manual search:

• Click the **"Manual Search"** tab
• Enter the guest's **name or email**
• Select from the results
• Click the **"Check In"** button
• Select the **"Manual Override"** option
• Enter the reason (e.g., "Phone battery dead")

Manual check-in is also recorded in the log.`,
    keywords: ['manual', 'search', 'override', 'backup'],
  },
  {
    id: 'checkin-duplicate',
    category: 'Check-in',
    question: 'What happens if someone tries to enter twice?',
    answer: `The system **automatically detects duplicate entry**.

**Yellow warning card appears**:
• "Already checked in"
• Original entry time
• Entry staff name

**Admin override** (admin users only):
1. Click the **"Admin Override"** button
2. Enter the reason
3. The system records the override

Overrides are marked separately in the log.`,
    keywords: ['duplicate', 'twice', 'already', 'override'],
  },
  {
    id: 'checkin-log',
    category: 'Check-in',
    question: 'How do I view the check-in log?',
    answer: `Go to the **Check-in Log** page.

**Statistics cards**:
• Total entries
• Entry rate (%)
• Recent entries

**Log filtering**:
• Search by name or email
• Filter by date range (from-to)
• Pagination for older entries

**Each entry shows**:
• Guest name and type
• Entry time
• Entry staff name
• Override flag (if applicable)`,
    keywords: ['log', 'history', 'entries', 'view'],
  },

  // ==========================================
  // PAYMENT HISTORY
  // ==========================================
  {
    id: 'pay-overview',
    category: 'Payment History',
    question: 'How does the Payment History page work?',
    answer: `Payment History provides an overview of all payments.

**Statistics cards**:
• Paid: Successful payments
• Pending: Waiting (bank transfer)
• Failed: Failed payments
• Today: Today's payments
• Total Revenue: Total revenue
• Today Revenue: Today's revenue

**Payment methods breakdown**:
• Card payments (Stripe)
• Bank transfers`,
    keywords: ['payment', 'history', 'revenue', 'overview'],
  },
  {
    id: 'pay-filter',
    category: 'Payment History',
    question: 'How do I filter payments?',
    answer: `**Available filters**:

1. **Search**: By guest name or email
2. **Status**:
   • Paid - Successful
   • Pending - Waiting
   • Failed - Failed
   • Refunded - Refunded
3. **Payment method**:
   • Card - Stripe
   • Bank Transfer
4. **Date range**: From-to

The **"Clear"** button clears all filters.`,
    keywords: ['filter', 'search', 'date', 'status'],
  },
  {
    id: 'pay-details',
    category: 'Payment History',
    question: 'What data do I see for payments?',
    answer: `**For each payment**:
• **Guest**: Name and email
• **Type**: Guest type badge + ticket type
• **Amount**: Paid amount (HUF)
• **Method**: Card or transfer icon
• **Status**: Color-coded badge
• **Paid At**: Payment time (if successful)
• **Created**: Creation time

**Pagination**: 20 payments per page.`,
    keywords: ['details', 'data', 'information', 'view'],
  },
  {
    id: 'pay-refund',
    category: 'Payment History',
    question: 'How do I issue a refund?',
    answer: `Refunds can now be issued **directly from the admin interface**:

**In-app refund (recommended)**:
1. Go to **Payment History** page
2. Find the payment (must be "Paid" status)
3. Click the **"Refund"** button
4. Confirm the refund

**What happens**:
• For **Stripe card payments**: Automatic refund via Stripe API
• For **bank transfers**: Status marked as refunded (manual transfer needed)
• Payment status changes to "Refunded"
• Guest's ticket remains valid (cancel separately if needed)

**Alternative - Stripe Dashboard**:
For partial refunds, use the [Stripe Dashboard](https://dashboard.stripe.com) directly.

Refunded payments appear with gray "Refunded" badge.`,
    keywords: ['refund', 'return', 'cancel', 'money back'],
  },
  {
    id: 'pay-view',
    category: 'Payment History',
    question: 'How do I view payment details?',
    answer: `1. Find the payment in the list
2. Click the **"View"** button
3. A detailed modal appears showing:

**Payment Info**:
• Amount and currency
• Status and payment method
• Ticket type
• Payment timestamps
• Stripe Payment Intent ID (for card payments)

**Guest Info**:
• Name, email, phone
• Guest type
• Company (if provided)

**Billing Info** (for paying guests):
• Billing name
• Company name and tax number
• Full billing address

This is useful for customer support and accounting purposes.`,
    keywords: ['view', 'details', 'billing', 'invoice'],
  },

  // ==========================================
  // EMAIL TEMPLATES
  // ==========================================
  {
    id: 'email-overview',
    category: 'Email Templates',
    question: 'How do email templates work?',
    answer: `Email templates define the content of emails sent by the system.

**Available templates**:
• **Magic Link**: Registration link sending
• **Ticket Delivery**: E-ticket delivery
• **Payment Reminder**: Payment reminder
• **Payment Confirmation**: Payment confirmation
• **Table Assignment**: Table notification
• **Event Reminder**: Event reminder
• **Applicant Approval**: Application approval
• **Applicant Rejection**: Application rejection

Every template has **HTML** and **plain text** versions.`,
    keywords: ['template', 'email', 'content'],
  },
  {
    id: 'email-edit',
    category: 'Email Templates',
    question: 'How do I edit an email template?',
    answer: `1. Select the template from the **left list**
2. Edit the fields:
   • **Name**: Template display name
   • **Subject**: Email subject
   • **HTML Body**: HTML formatted content
   • **Text Body**: Plain text version
3. Click the **"Save"** button

**Tip**: Use the "Preview" button to view with sample data.`,
    keywords: ['edit', 'modify', 'customize'],
  },
  {
    id: 'email-variables',
    category: 'Email Templates',
    question: 'What variables can I use in templates?',
    answer: `Templates use **{{variable_name}}** format placeholders.

**General variables**:
• \`{{guest_name}}\` - Guest name
• \`{{guest_email}}\` - Guest email
• \`{{guest_title}}\` - Salutation

**Registration variables**:
• \`{{magic_link}}\` - Registration link
• \`{{ticket_type}}\` - Ticket type
• \`{{partner_name}}\` - Partner name (for paired tickets)

**Event variables**:
• \`{{event_name}}\` - Event name
• \`{{event_date}}\` - Date
• \`{{event_venue}}\` - Venue

**Table variables**:
• \`{{table_name}}\` - Table name
• \`{{seat_number}}\` - Seat number`,
    keywords: ['variable', 'placeholder', 'dynamic'],
  },
  {
    id: 'email-preview',
    category: 'Email Templates',
    question: 'How do I preview an email?',
    answer: `1. Select the template
2. Click the **"Preview"** button
3. The system fills in variables with **sample data**
4. You can see:
   • Subject line
   • HTML rendering
   • Plain text version

The preview helps verify formatting and variable correctness.`,
    keywords: ['preview', 'view', 'test'],
  },
  {
    id: 'email-reset',
    category: 'Email Templates',
    question: 'How do I reset to the default template?',
    answer: `If you made a mistake:

1. Select the template
2. Click the **"Reset to Default"** button
3. Confirm the reset

**Warning**: This overwrites all your changes with the original template!

Consider saving the current version first (copy-paste to a file).`,
    keywords: ['reset', 'default', 'restore', 'original'],
  },

  // ==========================================
  // SCHEDULED EMAILS
  // ==========================================
  {
    id: 'sched-overview',
    category: 'Scheduled Emails',
    question: 'How does scheduled email sending work?',
    answer: `The Scheduled Emails page has **5 tabs**:

1. **Emails**: List and status of scheduled emails
2. **History**: Log of sent emails
3. **Schedule**: Individual email scheduling
4. **Bulk**: Bulk email sending with filters
5. **Automation**: Automatic rules management

**Statistics cards**:
• Pending: Waiting emails
• Sent Today: Today's sends
• Failed Today: Today's failures
• Next 24h: Due in next 24 hours`,
    keywords: ['scheduled', 'queue', 'automation'],
  },
  {
    id: 'sched-list',
    category: 'Scheduled Emails',
    question: 'How do I view scheduled emails?',
    answer: `On the **Emails** tab:

**Filter by status**:
• Pending - Waiting to send
• Sent - Successfully sent
• Failed - Failed sending
• Cancelled - Cancelled

**For each email you see**:
• Recipient name and email
• Template type
• Scheduled time
• Current status
• Creation time

**Actions**:
• Send Now: Immediate sending
• Cancel: Cancel scheduled email`,
    keywords: ['list', 'queue', 'pending', 'view'],
  },
  {
    id: 'sched-manual',
    category: 'Scheduled Emails',
    question: 'How do I schedule an email?',
    answer: `On the **Schedule** tab:

1. Search for guest by name or email
2. **Select recipients** with checkboxes
3. Select the **email template**
4. Set the **send time**
5. Click the **"Schedule Emails"** button

Scheduled emails appear on the Emails tab with "Pending" status.`,
    keywords: ['schedule', 'timing', 'send later'],
  },
  {
    id: 'sched-bulk',
    category: 'Scheduled Emails',
    question: 'How do I send bulk emails?',
    answer: `On the **Bulk** tab you can target guests with filters:

**Filter options**:
• **Guest Types**: VIP, Paying Single, Paying Paired
• **Registration Status**: Invited, Registered, Approved, etc.
• **Has Ticket**: Whether they have a ticket
• **Has Table**: Whether they have a table

**Sending steps**:
1. Set the filters
2. Select the template
3. Set the time
4. Click the **"Schedule Bulk"** button

The system calculates how many guests will receive the email.`,
    keywords: ['bulk', 'mass', 'filter', 'batch'],
  },
  {
    id: 'sched-auto',
    category: 'Scheduled Emails',
    question: 'How do automatic email rules work?',
    answer: `On the **Automation** tab you can manage automatic sending rules.

**Example rules**:
• Event Reminder: 7 days before the event
• Payment Reminder: Every 3 days for pending payments
• Table Assignment: Immediately after assignment

**Rule settings**:
• **Enabled/Disabled**: Toggle on/off
• **Template**: Which template to use
• **Days Before/After**: When to send
• **Send Time**: What time of day
• **Target Status**: Which guest statuses
• **Target Types**: Which guest types

Rules **run automatically** in the background.`,
    keywords: ['automation', 'rule', 'trigger', 'automatic'],
  },
  {
    id: 'sched-history',
    category: 'Scheduled Emails',
    question: 'How do I view email sending history?',
    answer: `On the **History** tab you can see all sent emails.

**Statistics**:
• Total sent emails
• Failed sends
• Today's sends
• Breakdown by type

**Filter options**:
• Status: Sent / Failed
• Email type: Magic Link, Ticket, etc.

**Each entry shows**:
• Recipient name and email
• Email type
• Subject
• Send time
• Status and error message (if any)`,
    keywords: ['history', 'log', 'sent', 'view'],
  },

  // ==========================================
  // STATISTICS
  // ==========================================
  {
    id: 'stats-overview',
    category: 'Statistics',
    question: 'What does the Statistics page show?',
    answer: `The Statistics page provides **comprehensive reports** about the event.

**Main KPI cards**:
• **Total Guests**: All guests and registration rate
• **Revenue**: Total revenue and pending amount
• **Occupancy**: Seating occupancy (%)
• **Check-in Rate**: Entry rate (%)

**Detailed statistics**:
• Registration by status and type
• Payment breakdown
• Seating overview
• Email sending statistics
• Dietary requirements summary`,
    keywords: ['statistics', 'report', 'overview', 'dashboard'],
  },
  {
    id: 'stats-registration',
    category: 'Statistics',
    question: 'How do I interpret registration statistics?',
    answer: `**Registration Overview** section:

**By status**:
• Invited: Invited, not yet registered
• Registered: Registered, awaiting payment
• Approved: Approved, has ticket
• Declined: Declined

**By type**:
• VIP Guests: Free VIP guests
• Paying (Single): Single ticket payers
• Paying (Paired): Paired ticket payers

The **Registration Rate** shows what % registered of those invited.`,
    keywords: ['registration', 'status', 'type', 'rate'],
  },
  {
    id: 'stats-payment',
    category: 'Statistics',
    question: 'How do I interpret payment statistics?',
    answer: `**Payment Statistics** section:

**Amounts**:
• Total Expected: Expected total revenue
• Paid: Received amount
• Pending: Waiting payments

**Breakdown by status**:
• Paid: Successful payments
• Pending: Waiting (transfer)
• Failed: Failed payments

**Payment method**:
• Card: Stripe card payments
• Bank Transfer: Bank transfers

This helps track financial status.`,
    keywords: ['payment', 'revenue', 'money', 'financial'],
  },
  {
    id: 'stats-seating',
    category: 'Statistics',
    question: 'How do I interpret seating statistics?',
    answer: `**Seating Overview** section:

**General data**:
• Total Tables: Number of tables
• Total Capacity: Total seats
• Assigned Seats: Assigned seats
• Unassigned Guests: Guests without table

**Breakdown by table type**:
For each type (Standard, VIP, Reserved):
• Number of tables
• Occupancy rate
• Progress bar visualization

The **Occupancy Rate** shows total utilization.`,
    keywords: ['seating', 'occupancy', 'tables', 'capacity'],
  },
  {
    id: 'stats-dietary',
    category: 'Statistics',
    question: 'Where do I see dietary requirements summary?',
    answer: `At the bottom of the Statistics page, the **Dietary Requirements** section:

**Categories**:
• Vegetarian
• Vegan
• Gluten-free
• Lactose-free
• Other (custom specified)

Each category shows **the number of guests**.

This is especially useful for **catering planning** - send the numbers to your provider!`,
    keywords: ['dietary', 'allergy', 'vegetarian', 'catering'],
  },

  // ==========================================
  // EMAIL LOGS
  // ==========================================
  {
    id: 'elog-overview',
    category: 'Email Logs',
    question: 'How does the Email Logs page work?',
    answer: `Email Logs provides a complete overview of all sent emails.

**Statistics cards**:
• Total Sent: Successfully delivered emails
• Total Failed: Failed deliveries
• Sent Today: Today's successful sends
• Email Types: Number of different email types

**For each email you see**:
• Status (Sent, Failed, Pending)
• Recipient name and email
• Subject line
• Email type (magic_link, ticket, etc.)
• Sent timestamp`,
    keywords: ['email', 'log', 'history', 'sent', 'overview'],
  },
  {
    id: 'elog-filter',
    category: 'Email Logs',
    question: 'How do I filter email logs?',
    answer: `**Available filters**:

1. **Search**: By recipient name or email address
2. **Status**:
   • Sent - Successfully delivered
   • Failed - Delivery failed
   • Pending - Waiting to send
3. **Type**: Filter by email type (magic_link, ticket, payment_confirmation, etc.)

The filters combine - you can search for failed magic_link emails for a specific recipient.`,
    keywords: ['filter', 'search', 'status', 'type'],
  },
  {
    id: 'elog-view',
    category: 'Email Logs',
    question: 'How do I view email content?',
    answer: `1. Find the email in the list
2. Click the **eye icon** to view details
3. A modal appears showing:
   • Status and type
   • Recipient info
   • Subject line
   • Sent timestamp
   • **Error message** (if failed)
   • **Full email content** (HTML or plain text)

This is useful for debugging delivery issues or verifying email content.`,
    keywords: ['view', 'content', 'preview', 'details'],
  },
  {
    id: 'elog-delete',
    category: 'Email Logs',
    question: 'Can I delete email logs?',
    answer: `Yes, you can delete individual email logs:

1. Find the email in the list
2. Click the **trash icon**
3. Confirm the deletion

**Note**: Deletion is permanent and cannot be undone. Consider keeping failed emails for debugging purposes.

Logs are useful for:
• Audit trail
• Debugging delivery issues
• Tracking communication history`,
    keywords: ['delete', 'remove', 'clear'],
  },
  {
    id: 'elog-errors',
    category: 'Email Logs',
    question: 'What do I do if emails are failing?',
    answer: `If you see failed emails:

1. Click the **eye icon** to view the error message
2. Common errors:
   • **Invalid email address**: Guest email is malformed
   • **SMTP connection failed**: Email server issue
   • **Rate limit exceeded**: Too many emails sent
   • **Recipient rejected**: Email bounced

**Troubleshooting**:
• Check the guest's email address is correct
• Contact system administrator for SMTP issues
• Wait and retry for rate limit errors
• For bounced emails, contact the guest for updated address`,
    keywords: ['error', 'failed', 'troubleshoot', 'debug'],
  },

  // ==========================================
  // USER MANAGEMENT
  // ==========================================
  {
    id: 'user-overview',
    category: 'User Management',
    question: 'How does user management work?',
    answer: `The User Management page allows admins to manage system users.

**User list shows**:
• User name and email
• Role (Admin or Staff)
• Check-in count (how many guests they've checked in)
• Created date

**Available operations**:
• Create new user
• Edit existing user
• Delete user

**Note**: Only Admin users can access user management.`,
    keywords: ['user', 'management', 'admin', 'staff', 'overview'],
  },
  {
    id: 'user-create',
    category: 'User Management',
    question: 'How do I create a new user?',
    answer: `1. Click the **"+ Add User"** button
2. Fill out the form:
   • **Name**: Display name
   • **Email**: Login email (must be unique)
   • **Password**: Minimum 8 characters
   • **Role**: Admin or Staff
3. Click **"Save"**

**Role differences**:
• **Admin**: Full access to all features
• **Staff**: Check-in only (QR scanning)`,
    keywords: ['create', 'add', 'new', 'user'],
  },
  {
    id: 'user-edit',
    category: 'User Management',
    question: 'How do I edit a user?',
    answer: `1. Find the user in the list
2. Click the **pencil icon**
3. Modify fields:
   • Name
   • Email
   • Password (leave blank to keep current)
   • Role
4. Click **"Save"**

**Password update**: Leave the password field empty to keep the existing password. Only fill it in if you want to change it.`,
    keywords: ['edit', 'modify', 'update', 'password', 'role'],
  },
  {
    id: 'user-delete',
    category: 'User Management',
    question: 'How do I delete a user?',
    answer: `1. Find the user in the list
2. Click the **trash icon**
3. Confirm the deletion

**Warning**: Deletion is permanent!

**Important notes**:
• You cannot delete your own account
• Check-in history is preserved (for audit purposes)
• Consider changing the password instead of deleting if you want to revoke access`,
    keywords: ['delete', 'remove', 'user'],
  },
  {
    id: 'user-roles',
    category: 'User Management',
    question: 'What are the differences between Admin and Staff roles?',
    answer: `**Admin role** has full access:
• Guest management (add, edit, delete)
• Payment management and approval
• Seating arrangement
• Email sending and templates
• Statistics and reports
• User management
• Check-in with override capability

**Staff role** is limited to:
• Check-in function only
• QR code scanning
• Manual guest search
• **No** override for duplicate check-ins

Choose Staff for event day volunteers who only need to scan tickets.`,
    keywords: ['role', 'admin', 'staff', 'permission', 'access'],
  },

  // ==========================================
  // SYSTEM & TECHNICAL
  // ==========================================
  {
    id: 'tech-roles',
    category: 'System & Technical',
    question: 'What user roles are there?',
    answer: `**Admin**:
• Full access to all features
• Guest management, payment approval
• Seating, email sending, statistics
• Check-in override permission

**Staff**:
• Check-in function only
• QR scanning and manual entry
• No override permission

User management is the Super Admin's responsibility.`,
    keywords: ['role', 'permission', 'access', 'admin', 'staff'],
  },
  {
    id: 'tech-mobile',
    category: 'System & Technical',
    question: 'Can the admin interface be used on mobile?',
    answer: `**Yes, the admin interface is mobile-friendly!**

**Mobile navigation**:
• Bottom tab bar: Home, Guests, Seating, Stats, More
• The "More" button accesses other features

**Optimized pages**:
• Check-in page: Full-screen QR scanning
• Guest List: Scrolling and basic operations
• Statistics: KPI cards stacked

**Desktop recommended**:
• Seating drag & drop (larger screen)
• Email template editing
• CSV import preview`,
    keywords: ['mobile', 'phone', 'tablet', 'responsive'],
  },
  {
    id: 'tech-security',
    category: 'System & Technical',
    question: 'How is guest data protected?',
    answer: `**Security measures**:

**Access protection**:
• Login required for all admin pages
• Session timeout after inactivity
• Role-based access control

**Data security**:
• HTTPS encryption for all communication
• Passwords hashed with bcrypt
• Magic links expire after 24 hours

**Payment security**:
• Stripe handles card data (PCI-DSS compliant)
• Card data is NOT stored by us

**Audit log**:
• All check-ins recorded
• Email sends logged`,
    keywords: ['security', 'protection', 'gdpr', 'privacy'],
  },
  {
    id: 'tech-password',
    category: 'System & Technical',
    question: 'How do I change my password?',
    answer: `For password change, **contact the system administrator**.

For security reasons, password management is done manually.

**Contact**:
admin@ceogala.hu

Please provide:
• Your username
• Why you want to change
• Verification information (e.g., email)`,
    keywords: ['password', 'change', 'reset', 'login'],
  },
  {
    id: 'tech-support',
    category: 'System & Technical',
    question: 'Where can I get technical help?',
    answer: `**Technical support**:

**Email**: admin@ceogala.hu

**Before writing, prepare**:
• What operation you tried
• What happened (error message, screenshot)
• Which browser you use

**Common solutions**:
• Refresh the page (F5)
• Try another browser
• Check internet connection
• Clear browser cache`,
    keywords: ['support', 'help', 'error', 'problem'],
  },
  {
    id: 'diagram-dashboard',
    category: 'System & Technical',
    question: 'What is the Diagram Dashboard?',
    answer: `The **Diagram Dashboard** is a visual documentation hub accessible at **/admin/diagrams** (Test Hub menu).

**Contains 28 SVG diagrams** organized into categories:
• **Architecture** (6): System Overview, Tech Stack, DB Schema, API, Security, Component Architecture
• **Flows** (10): Registration, Payment, Check-in, Applicant flows, Admin vs Staff Roles
• **Admin UI** (6): Dashboard wireframes and workflows
• **Wireframes** (3): Guest Registration, PWA, Admin Core
• **Test Cases** (2): E2E test flow diagrams
• **Dataflow** (1): Email Rate Limiting

**Features**:
• HU/EN language toggle
• Dark mode support
• Notes for each diagram (CSV export/import)
• Responsive sidebar navigation`,
    keywords: ['diagram', 'dashboard', 'test', 'hub', 'svg', 'documentation', 'flow'],
  },
  {
    id: 'email-retry-logic',
    category: 'System & Technical',
    question: 'How does email retry and rate limiting work?',
    answer: `The email system includes **automatic retry** and **rate limiting**.

**Retry Logic**:
• 3 attempts per email
• Exponential backoff: 1s → 2s → 4s delays
• Automatic retries on transient errors

**Rate Limiting** (per guest):
• **5 emails per type per hour** (e.g., 5 magic links/hour)
• **20 total emails per hour** (all types combined)

**If rate limited**:
• Wait 1 hour and retry
• Use bulk email for large batches (handles limits automatically)

**All emails are logged** in the Email Logs page with delivery status.`,
    keywords: ['email', 'retry', 'rate', 'limit', 'backoff', 'delivery'],
  },
];

// Guide content - Hungarian version
export const adminGuidesHu: GuideItem[] = [
  // ==========================================
  // GUEST LIST - /admin/guests
  // ==========================================
  {
    id: 'gl-overview',
    category: 'Guest List',
    question: 'Hogyan működik a vendéglista?',
    answer: `A vendéglista az összes meghívott és regisztrált vendég központi kezelőfelülete. Itt láthatod:

• **Vendég adatok**: Név, email, cím, vendég típus (VIP, Paying Single, Paying Paired)
• **Státusz**: Invited, Registered, Approved, Declined, Pending Approval
• **Fizetési állapot**: Pending, Paid, Failed (fizető vendégeknél)
• **Asztal kiosztás**: Melyik asztalnál ül a vendég
• **Email küldés**: Hány magic link-et küldtél már

A lista szűrhető vendég típus, státusz és asztal kiosztás szerint. Használd a keresőt név vagy email alapján.`,
    keywords: ['vendég', 'lista', 'guest', 'áttekintés', 'overview'],
  },
  {
    id: 'gl-add',
    category: 'Guest List',
    question: 'Hogyan adjak hozzá új vendéget?',
    answer: `1. Kattints a **"+ Add Guest"** gombra a lista felett
2. Töltsd ki az űrlapot:
   • **Name**: Vendég teljes neve (kötelező)
   • **Email**: Email cím - egyedinek kell lennie (kötelező)
   • **Title**: Megszólítás (Mr., Ms., Dr., stb.)
   • **Guest Type**: VIP (ingyenes), Paying Single (1 jegy), Paying Paired (2 jegy)
   • **Dietary Requirements**: Étrendi igények (vegetáriánus, vegán, gluténmentes, stb.)
   • **Seating Preferences**: Ültetési preferenciák
3. Kattints a **"Save"** gombra

A vendég "Invited" státusszal kerül be. Magic link küldéséhez jelöld ki és kattints az "Send Email" gombra.`,
    keywords: ['hozzáadás', 'új vendég', 'add', 'create', 'létrehozás'],
  },
  {
    id: 'gl-edit',
    category: 'Guest List',
    question: 'Hogyan szerkeszthetek egy vendéget?',
    answer: `1. Keresd meg a vendéget a listában
2. Kattints a **ceruza ikonra** (✏️) a vendég sorában
3. Módosítsd a kívánt mezőket
4. Kattints a **"Save Changes"** gombra

**Fontos**: Ha a vendég már regisztrált, az email cím nem módosítható. Az étrendi igények és ültetési preferenciák bármikor változtathatók.`,
    keywords: ['szerkesztés', 'módosítás', 'edit', 'update', 'változtatás'],
  },
  {
    id: 'gl-delete',
    category: 'Guest List',
    question: 'Hogyan törölhetek vendéget?',
    answer: `1. Keresd meg a vendéget a listában
2. Kattints a **kuka ikonra** (🗑️)
3. Erősítsd meg a törlést a felugró ablakban

**Figyelem**: A törlés végleges! Minden kapcsolódó adat törlődik:
• Regisztráció
• Fizetési adatok
• Asztal kiosztás
• Email napló

Törlés helyett érdemes lehet a vendéget "Declined" státuszra állítani.`,
    keywords: ['törlés', 'delete', 'remove', 'eltávolítás'],
  },
  {
    id: 'gl-filter',
    category: 'Guest List',
    question: 'Hogyan szűrhetem a vendéglistát?',
    answer: `A lista tetején található szűrők:

**Vendég típus szerint**:
• All Types - Minden vendég
• VIP - Ingyenes VIP vendégek
• Paying Single - Egy jegyes fizető vendégek
• Paying Paired - Páros jegyes fizető vendégek

**Státusz szerint**:
• All Statuses - Minden státusz
• Invited - Meghívott, még nem regisztrált
• Registered - Regisztrált, fizetésre vár
• Approved - Jóváhagyott, jegy kiküldve
• Declined - Visszautasított

**Asztal szerint**:
• All Tables - Minden vendég
• Unassigned - Nincs asztala
• [Asztal nevek] - Adott asztalhoz rendelt vendégek

A **keresőmező** név vagy email alapján szűr.`,
    keywords: ['szűrés', 'filter', 'keresés', 'search', 'típus', 'státusz'],
  },
  {
    id: 'gl-magic-link',
    category: 'Guest List',
    question: 'Hogyan küldhetek magic link meghívót?',
    answer: `**Egyéni küldés**:
1. Kattints a **boríték ikonra** (✉️) a vendég sorában
2. Ellenőrizd az email előnézetet
3. Kattints a **"Send"** gombra

**Tömeges küldés**:
1. Jelöld ki a vendégeket a checkbox-okkal
2. Kattints a **"Send Email"** gombra
3. Ellenőrizd a címzetteket az előnézetben
4. Kattints a **"Send to X recipients"** gombra

**Fontos tudnivalók**:
• A magic link 5 percig érvényes az első kattintás után
• Egy vendégnek több link is küldhető (a régi érvénytelenné válik)
• A küldött emailek száma látható minden vendégnél`,
    keywords: ['magic link', 'meghívó', 'email küldés', 'invitation', 'send'],
  },
  {
    id: 'gl-payment-approve',
    category: 'Guest List',
    question: 'Hogyan hagyhatom jóvá a banki átutalást?',
    answer: `Ha egy vendég banki átutalást választott fizetési módként:

1. Keresd meg a vendéget - "Pending" fizetési státusszal
2. Ellenőrizd a bankszámla kivonatodon, hogy megérkezett-e az utalás
3. Kattints a **"✓ Approve"** gombra a vendég sorában
4. Erősítsd meg a jóváhagyást

**A jóváhagyás után**:
• A vendég státusza "Approved" lesz
• Automatikusan generálódik a QR kódos e-jegy
• Az e-jegy emailben kiküldésre kerül
• A vendég eléri a PWA alkalmazást

**Tipp**: A Statistics oldalon láthatod az összes pending fizetést.`,
    keywords: ['jóváhagyás', 'banki átutalás', 'approve', 'payment', 'fizetés'],
  },
  {
    id: 'gl-bulk',
    category: 'Guest List',
    question: 'Hogyan végezhetek tömeges műveleteket?',
    answer: `**Vendégek kijelölése**:
• Kattints a checkbox-ra minden vendégnél egyesével
• Vagy használd a fejléc checkbox-ot az összes kijelöléséhez

**Elérhető tömeges műveletek**:
1. **Send Email** - Magic link küldés a kijelölt vendégeknek
2. **Delete** - Kijelölt vendégek törlése (megerősítés szükséges)

A kijelölt vendégek száma látható a műveleti gombok mellett.`,
    keywords: ['tömeges', 'bulk', 'kijelölés', 'select', 'művelet'],
  },

  // ==========================================
  // CSV IMPORT
  // ==========================================
  {
    id: 'csv-overview',
    category: 'CSV Import',
    question: 'Hogyan működik a CSV import?',
    answer: `A CSV import lehetővé teszi vendégek tömeges feltöltését fájlból.

**Támogatott formátum**: CSV (vesszővel elválasztott értékek)

**Kötelező oszlopok**:
• \`email\` - Vendég email címe (egyedinek kell lennie)
• \`name\` - Vendég teljes neve
• \`guest_type\` - Típus: vip, paying_single, vagy paying_paired

**Opcionális oszlopok**:
• \`title\` - Megszólítás (Mr., Ms., Dr.)
• \`phone\` - Telefonszám
• \`company\` - Cég neve
• \`position\` - Pozíció
• \`dietary_requirements\` - Étrendi igények
• \`seating_preferences\` - Ültetési preferenciák`,
    keywords: ['csv', 'import', 'feltöltés', 'upload', 'bulk'],
  },
  {
    id: 'csv-format',
    category: 'CSV Import',
    question: 'Milyen formátumú legyen a CSV fájl?',
    answer: `**Példa CSV fájl tartalom**:
\`\`\`
email,name,guest_type,title,company
john@example.com,John Doe,vip,Mr.,Acme Inc.
jane@example.com,Jane Smith,paying_single,Ms.,Tech Corp
bob@example.com,Bob Wilson,paying_paired,Dr.,Health Ltd.
\`\`\`

**Szabályok**:
• Az első sor fejléc kell legyen az oszlopnevekkel
• Az email cím egyedi - duplikátumok kihagyásra kerülnek
• A guest_type értékek: \`vip\`, \`paying_single\`, \`paying_paired\`
• UTF-8 kódolás javasolt magyar karakterekhez
• Használj idézőjeleket ha az érték vesszőt tartalmaz`,
    keywords: ['formátum', 'format', 'oszlop', 'column', 'példa'],
  },
  {
    id: 'csv-upload',
    category: 'CSV Import',
    question: 'Hogyan tölthetek fel CSV fájlt?',
    answer: `1. Menj a **Guest List** → **"CSV Import"** gombra
2. **Húzd be a fájlt** a kijelölt területre, vagy kattints a tallózáshoz
3. A rendszer **előnézetben** mutatja a beolvasott adatokat
4. Ellenőrizd az adatokat - hibák pirossal jelennek meg
5. Kattints az **"Import"** gombra

**Import eredmények**:
• ✅ **Sikeres**: Hány vendég lett importálva
• ⚠️ **Kihagyva**: Duplikált email címek
• ❌ **Hiba**: Hibás formátumú sorok részletezése

Az importált vendégek "Invited" státusszal kerülnek be.`,
    keywords: ['feltöltés', 'upload', 'drag', 'drop', 'húzás'],
  },
  {
    id: 'csv-errors',
    category: 'CSV Import',
    question: 'Mit tegyek ha hibákat kapok az import során?',
    answer: `**Gyakori hibák és megoldások**:

**"Invalid guest_type"**:
• Ellenőrizd hogy pontosan \`vip\`, \`paying_single\` vagy \`paying_paired\` szerepel-e

**"Email already exists"**:
• Ez a vendég már szerepel a rendszerben - kihagyásra kerül

**"Missing required field"**:
• Hiányzik az email, name vagy guest_type oszlop

**"Invalid email format"**:
• Az email cím formátuma hibás

**Javítási lépések**:
1. Töltsd le a hibajelentést
2. Javítsd a hibás sorokat a CSV-ben
3. Töltsd fel újra csak a javított sorokat`,
    keywords: ['hiba', 'error', 'javítás', 'fix', 'probléma'],
  },

  // ==========================================
  // APPLICATIONS
  // ==========================================
  {
    id: 'app-overview',
    category: 'Applications',
    question: 'Hogyan működik a jelentkezések kezelése?',
    answer: `A nem meghívott vendégek a publikus **/apply** oldalon jelentkezhetnek.

**Jelentkezési folyamat**:
1. A vendég kitölti a jelentkezési űrlapot
2. A jelentkezés "Pending Approval" státusszal érkezik
3. Admin átnézi a jelentkezést
4. Jóváhagyás → Magic link küldés (72 órás érvényesség)
5. Elutasítás → Indoklással értesítés

**Az Applications oldalon látod**:
• Várakozó jelentkezések száma
• Összes jelentkezés
• Szűrés státusz szerint (Pending, Rejected)`,
    keywords: ['jelentkezés', 'application', 'apply', 'várakozó', 'pending'],
  },
  {
    id: 'app-approve',
    category: 'Applications',
    question: 'Hogyan hagyhatom jóvá a jelentkezést?',
    answer: `1. Menj az **Applications** oldalra
2. Kattints a **szem ikonra** (👁️) a jelentkező részleteinek megtekintéséhez
3. Ellenőrizd az adatokat:
   • Név, email, cég, pozíció
   • Étrendi igények
   • Ültetési preferenciák
4. Kattints a **zöld "✓ Approve"** gombra

**Jóváhagyás után**:
• A vendég "paying_single" típusú lesz
• 72 órás magic link generálódik és kiküldésre kerül
• A vendég regisztrálhat és fizethet`,
    keywords: ['jóváhagyás', 'approve', 'elfogadás', 'accept'],
  },
  {
    id: 'app-reject',
    category: 'Applications',
    question: 'Hogyan utasíthatok el jelentkezést?',
    answer: `1. Menj az **Applications** oldalra
2. Kattints a **piros "✕ Reject"** gombra
3. A felugró ablakban **írd be az elutasítás okát**
4. Kattints a **"Confirm Rejection"** gombra

**Az elutasítás után**:
• A jelentkező email értesítést kap
• A státusz "Rejected" lesz
• Az indoklás megjelenik a rendszerben

**Tipp**: Az elutasított jelentkezések nem törölhetők - ez audit célokat szolgál.`,
    keywords: ['elutasítás', 'reject', 'visszautasítás', 'deny'],
  },

  // ==========================================
  // SEATING ARRANGEMENT
  // ==========================================
  {
    id: 'seat-overview',
    category: 'Seating Arrangement',
    question: 'Hogyan működik az ültetési rend?',
    answer: `Az ültetési oldal interaktív drag & drop felületet biztosít.

**Két nézet érhető el**:
1. **Grid nézet**: Kártyás megjelenítés, asztalonként
2. **Floor Plan nézet**: 2D térkép kerek asztalokkal

**Funkciók**:
• Vendégek húzása asztalokra
• Vendégek áthelyezése asztalok között
• Vendégek eltávolítása asztalokról
• Statisztikák: foglaltság, kiosztott/kiosztásra váró vendégek

**Színkódok** (Floor Plan):
• 🟢 Zöld: Van szabad hely
• 🟡 Sárga: Részben foglalt
• 🔴 Piros: Tele van`,
    keywords: ['ültetés', 'seating', 'asztal', 'table', 'drag', 'drop'],
  },
  {
    id: 'seat-assign',
    category: 'Seating Arrangement',
    question: 'Hogyan rendelhetek vendéget asztalhoz?',
    answer: `**Grid nézetben**:
1. A bal oldali panelen látod a **kiosztásra váró vendégeket**
2. Fogd meg a vendég kártyáját
3. Húzd a kívánt asztal területére
4. Engedd el - a vendég hozzárendelődik

**Floor Plan nézetben**:
1. A bal oldali panelen válaszd ki a vendéget
2. Húzd a kerek asztal ikonra
3. Engedd el a célnál

**Páros jegyek**: A paying_paired vendégek automatikusan 2 helyet foglalnak!`,
    keywords: ['hozzárendelés', 'assign', 'asztalhoz', 'kiosztás'],
  },
  {
    id: 'seat-remove',
    category: 'Seating Arrangement',
    question: 'Hogyan távolíthatok el vendéget az asztalról?',
    answer: `**Grid nézetben**:
1. Kattints az asztal kártyán a vendég melletti **"✕" gombra**
2. A vendég visszakerül a kiosztásra váró panelra

**Floor Plan nézetben**:
1. Kattints az asztalra a részletek megjelenítéséhez
2. Kattints a vendég melletti **"✕" gombra**

**Drag & drop-pal**:
Húzd a vendéget vissza a bal oldali panelra.`,
    keywords: ['eltávolítás', 'remove', 'unassign', 'törlés'],
  },
  {
    id: 'seat-move',
    category: 'Seating Arrangement',
    question: 'Hogyan helyezhetek át vendéget másik asztalhoz?',
    answer: `Egyszerűen **húzd a vendéget az egyik asztalról a másikra**.

A rendszer automatikusan:
1. Eltávolítja a régi asztalról
2. Hozzárendeli az új asztalhoz

**Figyelem**:
• Ellenőrizd, hogy van-e szabad hely a cél asztalon
• Páros jegyeknél 2 szabad hely szükséges`,
    keywords: ['áthelyezés', 'move', 'másik asztal', 'transfer'],
  },
  {
    id: 'seat-csv',
    category: 'Seating Arrangement',
    question: 'Hogyan importálhatom az ültetési rendet CSV-ből?',
    answer: `1. Kattints az **"Import CSV"** gombra
2. A CSV formátum:
\`\`\`
guest_email,table_name
john@example.com,VIP Table 1
jane@example.com,Table 5
\`\`\`
3. Másold be a szövegdobozba
4. Kattints az **"Import"** gombra

**Eredmény**:
• Sikeres kiosztások száma
• Hibák részletezése (pl. nem létező asztal)`,
    keywords: ['import', 'csv', 'tömeges', 'bulk', 'kiosztás'],
  },
  {
    id: 'seat-export',
    category: 'Seating Arrangement',
    question: 'Hogyan exportálhatom az ültetési rendet?',
    answer: `1. Kattints az **"Export"** gombra
2. A CSV fájl automatikusan letöltődik

**A fájl tartalma**:
• Asztal neve
• Vendég neve
• Vendég email
• Ülőhely szám
• Vendég típus

Ez hasznos nyomtatáshoz vagy a rendezvény helyszínére küldéshez.`,
    keywords: ['export', 'letöltés', 'download', 'csv', 'mentés'],
  },

  // ==========================================
  // TABLE MANAGEMENT
  // ==========================================
  {
    id: 'table-overview',
    category: 'Table Management',
    question: 'Hogyan kezelhetem az asztalokat?',
    answer: `A **Seating** → **"Manage Tables"** linken érheted el az asztalkezelőt.

**Itt láthatod**:
• Összes asztal listája
• Kapacitás és foglaltság
• Asztal típus (Standard, VIP, Reserved)
• Kiosztott vendégek listája

**Műveletek**:
• Új asztal létrehozása
• Meglévő asztal szerkesztése
• Asztal törlése (csak ha üres)`,
    keywords: ['asztal', 'table', 'kezelés', 'management'],
  },
  {
    id: 'table-create',
    category: 'Table Management',
    question: 'Hogyan hozhatok létre új asztalt?',
    answer: `1. Kattints a **"+ Add Table"** gombra
2. Töltsd ki az űrlapot:
   • **Name**: Asztal neve (pl. "VIP Table 1", "Table 5")
   • **Capacity**: Férőhelyek száma (1-20)
   • **Type**: Standard, VIP, vagy Reserved
3. Kattints a **"Create"** gombra

Az új asztal megjelenik a listában és az ültetési térképen.`,
    keywords: ['létrehozás', 'create', 'új asztal', 'add'],
  },
  {
    id: 'table-edit',
    category: 'Table Management',
    question: 'Hogyan szerkeszthetek egy asztalt?',
    answer: `1. Kattints a **ceruza ikonra** az asztal sorában
2. Módosítsd:
   • Név
   • Kapacitás (nem lehet kevesebb mint a jelenlegi foglaltság!)
   • Típus
3. Kattints a **"Save"** gombra

**Figyelem**: Ha csökkented a kapacitást, előbb el kell távolítanod vendégeket.`,
    keywords: ['szerkesztés', 'edit', 'módosítás', 'update'],
  },
  {
    id: 'table-delete',
    category: 'Table Management',
    question: 'Hogyan törölhetek asztalt?',
    answer: `1. Kattints a **kuka ikonra** az asztal sorában
2. Erősítsd meg a törlést

**Csak üres asztal törölhető!**

Ha vannak hozzárendelt vendégek:
1. Menj az ültetési oldalra
2. Helyezd át a vendégeket másik asztalhoz
3. Térj vissza és töröld az asztalt`,
    keywords: ['törlés', 'delete', 'eltávolítás', 'remove'],
  },

  // ==========================================
  // CHECK-IN
  // ==========================================
  {
    id: 'checkin-overview',
    category: 'Check-in',
    question: 'Hogyan működik a check-in rendszer?',
    answer: `A check-in a rendezvény napján a vendégek beléptető rendszere.

**Check-in módok**:
1. **QR kód szkennelés**: Vendég megmutatja az e-jegyét
2. **Manuális keresés**: Név vagy email alapján

**Check-in Log oldal mutatja**:
• Összesített statisztikák
• Minden check-in esemény idősorrendben
• Keresés és szűrés dátum szerint

**Színkódok** a szkennelésnél:
• 🟢 Zöld: Érvényes jegy → "Check In" gomb
• 🟡 Sárga: Már bejelentkezett → "Override" lehetőség
• 🔴 Piros: Érvénytelen/lejárt jegy → Hiba`,
    keywords: ['check-in', 'beléptetés', 'qr', 'scan', 'szkennelés'],
  },
  {
    id: 'checkin-scan',
    category: 'Check-in',
    question: 'Hogyan szkenneljek QR kódot?',
    answer: `1. Menj a **/checkin** oldalra (mobil optimalizált)
2. Engedélyezd a kamera hozzáférést
3. Tartsd a vendég QR kódját a kamera elé
4. A rendszer automatikusan beolvassa

**Sikeres beolvasás után**:
• Megjelenik a vendég neve és típusa
• Kattints a **"Check In"** gombra
• A vendég belépése rögzítve

**Staff felhasználók** csak a check-in funkciót látják.`,
    keywords: ['szkennelés', 'scan', 'qr', 'kamera', 'beolvasás'],
  },
  {
    id: 'checkin-manual',
    category: 'Check-in',
    question: 'Mit tegyek ha a QR kód nem működik?',
    answer: `Ha a szkennelés nem sikerül, használd a manuális keresést:

• Kattints a **"Manual Search"** fülre
• Írd be a vendég **nevét vagy email címét**
• Válaszd ki a találatok közül
• Kattints a **"Check In"** gombra
• Válaszd a **"Manual Override"** opciót
• Írd be az okot (pl. "Telefon kimerült")

A manuális check-in is rögzítődik a naplóban.`,
    keywords: ['manuális', 'manual', 'keresés', 'search', 'override'],
  },
  {
    id: 'checkin-duplicate',
    category: 'Check-in',
    question: 'Mi történik ha valaki kétszer próbál belépni?',
    answer: `A rendszer **automatikusan felismeri a duplikált belépést**.

**Sárga figyelmeztető kártya jelenik meg**:
• "Already checked in"
• Eredeti belépés időpontja
• Beléptető staff neve

**Admin override** (csak admin felhasználóknak):
1. Kattints az **"Admin Override"** gombra
2. Írd be az okot
3. A rendszer rögzíti az override-ot

Az override-ok külön jelölve vannak a naplóban.`,
    keywords: ['duplikált', 'duplicate', 'kétszer', 'already', 'override'],
  },
  {
    id: 'checkin-log',
    category: 'Check-in',
    question: 'Hogyan nézhetem meg a check-in naplót?',
    answer: `Menj a **Check-in Log** oldalra.

**Statisztika kártyák**:
• Összes belépés
• Belépési arány (%)
• Legutóbbi belépések

**Napló szűrése**:
• Keresés név vagy email alapján
• Dátum szerinti szűrés (tól-ig)
• Lapozás a régebbi bejegyzésekhez

**Minden bejegyzés mutatja**:
• Vendég neve és típusa
• Belépés időpontja
• Beléptető staff neve
• Override jelölés (ha volt)`,
    keywords: ['napló', 'log', 'history', 'előzmények'],
  },

  // ==========================================
  // PAYMENT HISTORY
  // ==========================================
  {
    id: 'pay-overview',
    category: 'Payment History',
    question: 'Hogyan működik a Payment History oldal?',
    answer: `A Payment History átfogó képet ad minden fizetésről.

**Statisztika kártyák**:
• 🟢 Paid: Sikeres fizetések
• 🟡 Pending: Várakozó (banki átutalás)
• 🔴 Failed: Sikertelen fizetések
• 📅 Today: Mai fizetések
• 💰 Total Revenue: Össz bevétel
• 📈 Today Revenue: Mai bevétel

**Fizetési módok bontása**:
• Kártyás fizetések (Stripe)
• Banki átutalások`,
    keywords: ['fizetés', 'payment', 'bevétel', 'revenue', 'history'],
  },
  {
    id: 'pay-filter',
    category: 'Payment History',
    question: 'Hogyan szűrhetem a fizetéseket?',
    answer: `**Elérhető szűrők**:

1. **Keresés**: Vendég neve vagy email címe alapján
2. **Státusz**:
   • Paid - Sikeres
   • Pending - Várakozó
   • Failed - Sikertelen
   • Refunded - Visszatérített
3. **Fizetési mód**:
   • Card - Kártyás (Stripe)
   • Bank Transfer - Átutalás
4. **Dátum tartomány**: Tól-ig

A **"Clear"** gomb törli az összes szűrőt.`,
    keywords: ['szűrés', 'filter', 'keresés', 'dátum'],
  },
  {
    id: 'pay-details',
    category: 'Payment History',
    question: 'Milyen adatokat látok a fizetéseknél?',
    answer: `**Minden fizetésnél**:
• **Vendég**: Név és email
• **Típus**: Vendég típus badge + jegy típus
• **Összeg**: Fizetett összeg (HUF)
• **Mód**: Kártya vagy átutalás ikon
• **Státusz**: Színkódolt badge
• **Paid At**: Fizetés időpontja (sikeres esetben)
• **Created**: Létrehozás időpontja

**Lapozás**: 20 fizetés oldalanként.`,
    keywords: ['részletek', 'details', 'adatok', 'információ'],
  },
  {
    id: 'pay-refund',
    category: 'Payment History',
    question: 'Hogyan végezhetek visszatérítést?',
    answer: `A visszatérítés mostantól **közvetlenül az admin felületen** indítható:

**In-app visszatérítés (ajánlott)**:
1. Menj a **Payment History** oldalra
2. Keresd meg a fizetést (csak "Paid" státuszú)
3. Kattints a **"Refund"** gombra
4. Erősítsd meg a visszatérítést

**Mi történik**:
• **Stripe kártyás fizetésnél**: Automatikus visszatérítés a Stripe API-n keresztül
• **Banki átutalásnál**: Státusz "refunded" lesz (manuális utalás szükséges)
• A fizetés státusza "Refunded" lesz
• A vendég jegye érvényes marad (külön kell törölni ha szükséges)

**Alternatíva - Stripe Dashboard**:
Részleges visszatérítéshez használd a [Stripe Dashboard](https://dashboard.stripe.com)-ot közvetlenül.

A visszatérített fizetések szürke "Refunded" badge-dzsel jelennek meg.`,
    keywords: ['visszatérítés', 'refund', 'visszautalás', 'cancel'],
  },
  {
    id: 'pay-view',
    category: 'Payment History',
    question: 'Hogyan nézhetem meg a fizetés részleteit?',
    answer: `1. Keresd meg a fizetést a listában
2. Kattints a **"View"** gombra
3. Részletes ablak jelenik meg:

**Fizetési adatok**:
• Összeg és pénznem
• Státusz és fizetési mód
• Jegy típus
• Fizetés időpontjai
• Stripe Payment Intent ID (kártyás fizetésnél)

**Vendég adatok**:
• Név, email, telefon
• Vendég típus
• Cég (ha megadva)

**Számlázási adatok** (fizető vendégeknél):
• Számlázási név
• Cégnév és adószám
• Teljes számlázási cím

Ez hasznos ügyfélszolgálathoz és könyvelési célokra.`,
    keywords: ['megtekintés', 'részletek', 'számlázás', 'számla'],
  },

  // ==========================================
  // EMAIL TEMPLATES
  // ==========================================
  {
    id: 'email-overview',
    category: 'Email Templates',
    question: 'Hogyan működnek az email sablonok?',
    answer: `Az email sablonok a rendszer által küldött levelek tartalmát határozzák meg.

**Elérhető sablonok**:
• **Magic Link**: Regisztrációs link küldése
• **Ticket Delivery**: E-jegy kiküldése
• **Payment Reminder**: Fizetési emlékeztető
• **Payment Confirmation**: Fizetés visszaigazolása
• **Table Assignment**: Asztal értesítés
• **Event Reminder**: Rendezvény emlékeztető
• **Applicant Approval**: Jelentkezés jóváhagyása
• **Applicant Rejection**: Jelentkezés elutasítása

Minden sablonnak van **HTML** és **sima szöveg** verziója.`,
    keywords: ['sablon', 'template', 'email', 'levél'],
  },
  {
    id: 'email-edit',
    category: 'Email Templates',
    question: 'Hogyan szerkeszthetek email sablont?',
    answer: `1. Válaszd ki a sablont a **bal oldali listából**
2. Szerkeszd a mezőket:
   • **Name**: Sablon megjelenítési neve
   • **Subject**: Email tárgya
   • **HTML Body**: HTML formátumú tartalom
   • **Text Body**: Sima szöveg verzió
3. Kattints a **"Save"** gombra

**Tipp**: Használd a "Preview" gombot az előnézet megtekintéséhez minta adatokkal.`,
    keywords: ['szerkesztés', 'edit', 'módosítás', 'testreszabás'],
  },
  {
    id: 'email-variables',
    category: 'Email Templates',
    question: 'Milyen változókat használhatok a sablonokban?',
    answer: `A sablonokban **{{változó_név}}** formátumú helyettesítők használhatók.

**Általános változók**:
• \`{{guest_name}}\` - Vendég neve
• \`{{guest_email}}\` - Vendég email
• \`{{guest_title}}\` - Megszólítás

**Regisztráció változók**:
• \`{{magic_link}}\` - Regisztrációs link
• \`{{ticket_type}}\` - Jegy típusa
• \`{{partner_name}}\` - Partner neve (páros jegynél)

**Rendezvény változók**:
• \`{{event_name}}\` - Rendezvény neve
• \`{{event_date}}\` - Dátum
• \`{{event_venue}}\` - Helyszín

**Asztal változók**:
• \`{{table_name}}\` - Asztal neve
• \`{{seat_number}}\` - Ülőhely szám`,
    keywords: ['változó', 'variable', 'placeholder', 'helyettesítő'],
  },
  {
    id: 'email-preview',
    category: 'Email Templates',
    question: 'Hogyan tekinthetem meg az email előnézetet?',
    answer: `1. Válaszd ki a sablont
2. Kattints a **"Preview"** gombra
3. A rendszer **minta adatokkal** kitölti a változókat
4. Láthatod:
   • Tárgymező
   • HTML megjelenítés
   • Sima szöveg verzió

Az előnézet segít ellenőrizni a formázást és a változók helyességét.`,
    keywords: ['előnézet', 'preview', 'megtekintés', 'teszt'],
  },
  {
    id: 'email-reset',
    category: 'Email Templates',
    question: 'Hogyan állíthatom vissza az alapértelmezett sablont?',
    answer: `Ha elrontottál egy sablont:

1. Válaszd ki a sablont
2. Kattints a **"Reset to Default"** gombra
3. Erősítsd meg a visszaállítást

**Figyelem**: Ez felülírja az összes módosításodat az eredeti sablonnal!

Érdemes előtte menteni a jelenlegi verziót (copy-paste egy fájlba).`,
    keywords: ['visszaállítás', 'reset', 'default', 'alapértelmezett'],
  },

  // ==========================================
  // SCHEDULED EMAILS
  // ==========================================
  {
    id: 'sched-overview',
    category: 'Scheduled Emails',
    question: 'Hogyan működik az ütemezett email küldés?',
    answer: `A Scheduled Emails oldal **5 fülből** áll:

1. **Emails**: Ütemezett emailek listája és státusza
2. **History**: Elküldött emailek naplója
3. **Schedule**: Egyéni email ütemezés
4. **Bulk**: Tömeges email küldés szűrőkkel
5. **Automation**: Automatikus szabályok kezelése

**Statisztika kártyák**:
• Pending: Várakozó emailek
• Sent Today: Mai küldések
• Failed Today: Mai hibák
• Next 24h: Következő 24 órában esedékes`,
    keywords: ['ütemezés', 'scheduled', 'queue', 'sor'],
  },
  {
    id: 'sched-list',
    category: 'Scheduled Emails',
    question: 'Hogyan nézhetem meg az ütemezett emaileket?',
    answer: `Az **Emails** fülön:

**Szűrés státusz szerint**:
• Pending - Küldésre vár
• Sent - Sikeresen elküldve
• Failed - Sikertelen küldés
• Cancelled - Visszavonva

**Minden emailnél látod**:
• Címzett neve és email címe
• Sablon típusa
• Ütemezett időpont
• Jelenlegi státusz
• Létrehozás ideje

**Műveletek**:
• ▶️ Send Now: Azonnali küldés
• 🗑️ Cancel: Visszavonás`,
    keywords: ['lista', 'queue', 'pending', 'várakozó'],
  },
  {
    id: 'sched-manual',
    category: 'Scheduled Emails',
    question: 'Hogyan ütemezhetek email küldést?',
    answer: `A **Schedule** fülön:

1. Keress vendéget név vagy email alapján
2. **Jelöld ki a címzetteket** a checkbox-okkal
3. Válaszd ki az **email sablont**
4. Állítsd be a **küldési időpontot**
5. Kattints a **"Schedule Emails"** gombra

Az ütemezett emailek megjelennek az Emails fülön "Pending" státusszal.`,
    keywords: ['ütemezés', 'schedule', 'időzítés', 'küldés'],
  },
  {
    id: 'sched-bulk',
    category: 'Scheduled Emails',
    question: 'Hogyan küldhetek tömeges emailt?',
    answer: `A **Bulk** fülön szűrők alapján célozhatod a vendégeket:

**Szűrési lehetőségek**:
• **Guest Types**: VIP, Paying Single, Paying Paired
• **Registration Status**: Invited, Registered, Approved, stb.
• **Has Ticket**: Van-e már jegye
• **Has Table**: Van-e asztala

**Küldés lépései**:
1. Állítsd be a szűrőket
2. Válaszd ki a sablont
3. Add meg az időpontot
4. Kattints a **"Schedule Bulk"** gombra

A rendszer kiszámolja hány vendégnek megy az email.`,
    keywords: ['tömeges', 'bulk', 'mass', 'szűrő', 'filter'],
  },
  {
    id: 'sched-auto',
    category: 'Scheduled Emails',
    question: 'Hogyan működnek az automatikus email szabályok?',
    answer: `Az **Automation** fülön automatikus küldési szabályokat kezelhetsz.

**Példa szabályok**:
• Event Reminder: 7 nappal az esemény előtt
• Payment Reminder: 3 naponta a pending fizetéseknél
• Table Assignment: Asztal kiosztás után azonnal

**Szabály beállítások**:
• **Enabled/Disabled**: Ki-be kapcsolás
• **Template**: Melyik sablont használja
• **Days Before/After**: Mikor küldse
• **Send Time**: Nap melyik órájában
• **Target Status**: Milyen státuszú vendégeknek
• **Target Types**: Milyen típusú vendégeknek

A szabályok **automatikusan futnak** a háttérben.`,
    keywords: ['automatikus', 'automation', 'szabály', 'rule', 'trigger'],
  },
  {
    id: 'sched-history',
    category: 'Scheduled Emails',
    question: 'Hogyan nézhetem meg az email küldési előzményeket?',
    answer: `A **History** fülön az összes elküldött email látható.

**Statisztikák**:
• Összes küldött email
• Sikertelen küldések
• Mai küldések
• Típus szerinti bontás

**Szűrési lehetőségek**:
• Státusz: Sent / Failed
• Email típus: Magic Link, Ticket, stb.

**Minden bejegyzésnél**:
• Címzett neve és email
• Email típusa
• Tárgy
• Küldés időpontja
• Státusz és hiba üzenet (ha volt)`,
    keywords: ['előzmények', 'history', 'log', 'napló', 'küldött'],
  },

  // ==========================================
  // STATISTICS
  // ==========================================
  {
    id: 'stats-overview',
    category: 'Statistics',
    question: 'Mit mutat a Statistics oldal?',
    answer: `A Statistics oldal **átfogó jelentéseket** ad a rendezvényről.

**Fő KPI kártyák**:
• 👥 **Total Guests**: Összes vendég és regisztrációs arány
• 💰 **Revenue**: Össz bevétel és pending összeg
• 🪑 **Occupancy**: Ültetési foglaltság (%)
• ✅ **Check-in Rate**: Belépési arány (%)

**Részletes statisztikák**:
• Regisztráció státusz és típus szerint
• Fizetések bontása
• Ültetés áttekintés
• Email küldés statisztikák
• Étrendi igények összesítés`,
    keywords: ['statisztika', 'statistics', 'riport', 'report', 'áttekintés'],
  },
  {
    id: 'stats-registration',
    category: 'Statistics',
    question: 'Hogyan értelmezzem a regisztrációs statisztikákat?',
    answer: `**Registration Overview** szekció:

**Státusz szerint**:
• Invited: Meghívott, még nem regisztrált
• Registered: Regisztrált, fizetésre vár
• Approved: Jóváhagyott, jeggyel rendelkezik
• Declined: Visszautasított

**Típus szerint**:
• VIP Guests: Ingyenes VIP vendégek
• Paying (Single): Egy jegyes fizető
• Paying (Paired): Páros jegyes fizető

A **Registration Rate** megmutatja hány % regisztrált a meghívottakból.`,
    keywords: ['regisztráció', 'registration', 'státusz', 'status'],
  },
  {
    id: 'stats-payment',
    category: 'Statistics',
    question: 'Hogyan értelmezzem a fizetési statisztikákat?',
    answer: `**Payment Statistics** szekció:

**Összegek**:
• Total Expected: Várható teljes bevétel
• Paid: Beérkezett összeg
• Pending: Várakozó fizetések

**Státusz szerinti bontás**:
• ✅ Paid: Sikeres fizetések
• ⏳ Pending: Várakozó (átutalás)
• ❌ Failed: Sikertelen fizetések

**Fizetési mód**:
• Card: Stripe kártyás fizetések
• Bank Transfer: Banki átutalások

Ez segít követni a pénzügyi állapotot.`,
    keywords: ['fizetés', 'payment', 'bevétel', 'revenue'],
  },
  {
    id: 'stats-seating',
    category: 'Statistics',
    question: 'Hogyan értelmezzem az ültetési statisztikákat?',
    answer: `**Seating Overview** szekció:

**Általános adatok**:
• Total Tables: Asztalok száma
• Total Capacity: Összes férőhely
• Assigned Seats: Kiosztott helyek
• Unassigned Guests: Asztal nélküli vendégek

**Asztal típus szerinti bontás**:
Minden típushoz (Standard, VIP, Reserved):
• Asztalok száma
• Foglaltság arány
• Progress bar vizualizáció

Az **Occupancy Rate** a teljes kihasználtságot mutatja.`,
    keywords: ['ültetés', 'seating', 'foglaltság', 'occupancy'],
  },
  {
    id: 'stats-dietary',
    category: 'Statistics',
    question: 'Hol látom az étrendi igények összesítését?',
    answer: `A Statistics oldal alján a **Dietary Requirements** szekció:

**Kategóriák**:
• Vegetarian
• Vegan
• Gluten-free
• Lactose-free
• Other (egyéb megadott)

Minden kategóriánál **látod a vendégek számát**.

Ez különösen hasznos a **catering tervezéshez** - küldd el a számokat a szolgáltatónak!`,
    keywords: ['étrend', 'dietary', 'allergia', 'vegetáriánus', 'catering'],
  },

  // ==========================================
  // EMAIL LOGS
  // ==========================================
  {
    id: 'elog-overview',
    category: 'Email Logs',
    question: 'Hogyan működik az Email napló oldal?',
    answer: `Az Email napló átfogó képet ad minden elküldött emailről.

**Statisztika kártyák**:
• Összes elküldött: Sikeresen kézbesített emailek
• Sikertelen: Hibás kézbesítések
• Ma küldött: Mai sikeres küldések
• Email típusok: Különböző email típusok száma

**Minden emailnél látható**:
• Státusz (Sent, Failed, Pending)
• Címzett neve és email címe
• Tárgy
• Email típus (magic_link, ticket, stb.)
• Küldés időpontja`,
    keywords: ['email', 'napló', 'log', 'küldött', 'áttekintés'],
  },
  {
    id: 'elog-filter',
    category: 'Email Logs',
    question: 'Hogyan szűrhetem az email naplót?',
    answer: `**Elérhető szűrők**:

1. **Keresés**: Címzett neve vagy email címe alapján
2. **Státusz**:
   • Sent - Sikeresen kézbesítve
   • Failed - Sikertelen kézbesítés
   • Pending - Küldésre vár
3. **Típus**: Email típus szerint (magic_link, ticket, payment_confirmation, stb.)

A szűrők kombinálhatók - kereshetsz sikertelen magic_link emaileket egy adott címzettnél.`,
    keywords: ['szűrés', 'filter', 'keresés', 'státusz', 'típus'],
  },
  {
    id: 'elog-view',
    category: 'Email Logs',
    question: 'Hogyan nézhetem meg az email tartalmát?',
    answer: `1. Keresd meg az emailt a listában
2. Kattints a **szem ikonra** a részletek megtekintéséhez
3. Megjelenik egy ablak:
   • Státusz és típus
   • Címzett adatai
   • Tárgy
   • Küldés időpontja
   • **Hibaüzenet** (sikertelen esetén)
   • **Teljes email tartalom** (HTML vagy sima szöveg)

Ez hasznos kézbesítési problémák hibakereséséhez vagy az email tartalom ellenőrzéséhez.`,
    keywords: ['megtekintés', 'tartalom', 'előnézet', 'részletek'],
  },
  {
    id: 'elog-delete',
    category: 'Email Logs',
    question: 'Törölhetem az email naplókat?',
    answer: `Igen, törölheted az egyes email naplókat:

1. Keresd meg az emailt a listában
2. Kattints a **kuka ikonra**
3. Erősítsd meg a törlést

**Figyelem**: A törlés végleges és nem visszavonható. Érdemes megtartani a sikertelen emaileket hibakeresési célból.

A naplók hasznosak:
• Audit nyomkövetéshez
• Kézbesítési problémák hibakereséséhez
• Kommunikációs előzmények követéséhez`,
    keywords: ['törlés', 'eltávolítás', 'delete'],
  },
  {
    id: 'elog-errors',
    category: 'Email Logs',
    question: 'Mit tegyek ha az emailek sikertelenek?',
    answer: `Ha sikertelen emaileket látsz:

1. Kattints a **szem ikonra** a hibaüzenet megtekintéséhez
2. Gyakori hibák:
   • **Invalid email address**: Hibás email cím formátum
   • **SMTP connection failed**: Email szerver probléma
   • **Rate limit exceeded**: Túl sok email küldve
   • **Recipient rejected**: Az email visszapattant

**Hibaelhárítás**:
• Ellenőrizd, hogy a vendég email címe helyes
• SMTP problémáknál keresd a rendszergazdát
• Rate limit hibánál várj és próbáld újra
• Visszapattant emaileknél kérd a vendégtől a frissített címet`,
    keywords: ['hiba', 'sikertelen', 'hibaelhárítás', 'debug'],
  },

  // ==========================================
  // USER MANAGEMENT
  // ==========================================
  {
    id: 'user-overview',
    category: 'User Management',
    question: 'Hogyan működik a felhasználó kezelés?',
    answer: `A Felhasználó kezelés oldalon az adminok kezelhetik a rendszer felhasználóit.

**A lista mutatja**:
• Felhasználó neve és email címe
• Szerepkör (Admin vagy Staff)
• Check-in szám (hány vendéget léptetett be)
• Létrehozás dátuma

**Elérhető műveletek**:
• Új felhasználó létrehozása
• Meglévő felhasználó szerkesztése
• Felhasználó törlése

**Megjegyzés**: Csak Admin felhasználók érhetik el a felhasználó kezelést.`,
    keywords: ['felhasználó', 'kezelés', 'admin', 'staff', 'áttekintés'],
  },
  {
    id: 'user-create',
    category: 'User Management',
    question: 'Hogyan hozhatok létre új felhasználót?',
    answer: `1. Kattints a **"+ Add User"** gombra
2. Töltsd ki az űrlapot:
   • **Name**: Megjelenítendő név
   • **Email**: Bejelentkezési email (egyedinek kell lennie)
   • **Password**: Minimum 8 karakter
   • **Role**: Admin vagy Staff
3. Kattints a **"Save"** gombra

**Szerepkör különbségek**:
• **Admin**: Teljes hozzáférés minden funkcióhoz
• **Staff**: Csak check-in (QR szkennelés)`,
    keywords: ['létrehozás', 'hozzáadás', 'új', 'felhasználó'],
  },
  {
    id: 'user-edit',
    category: 'User Management',
    question: 'Hogyan szerkeszthetek egy felhasználót?',
    answer: `1. Keresd meg a felhasználót a listában
2. Kattints a **ceruza ikonra**
3. Módosítsd a mezőket:
   • Név
   • Email
   • Jelszó (hagyd üresen a meglévő megtartásához)
   • Szerepkör
4. Kattints a **"Save"** gombra

**Jelszó frissítés**: Hagyd üresen a jelszó mezőt ha meg akarod tartani a meglévőt. Csak akkor töltsd ki, ha változtatni szeretnéd.`,
    keywords: ['szerkesztés', 'módosítás', 'frissítés', 'jelszó', 'szerepkör'],
  },
  {
    id: 'user-delete',
    category: 'User Management',
    question: 'Hogyan törölhetek felhasználót?',
    answer: `1. Keresd meg a felhasználót a listában
2. Kattints a **kuka ikonra**
3. Erősítsd meg a törlést

**Figyelem**: A törlés végleges!

**Fontos tudnivalók**:
• Nem törölheted a saját fiókodat
• A check-in előzmények megmaradnak (audit célokból)
• Fontold meg a jelszó megváltoztatását törlés helyett, ha csak a hozzáférést akarod visszavonni`,
    keywords: ['törlés', 'eltávolítás', 'felhasználó'],
  },
  {
    id: 'user-roles',
    category: 'User Management',
    question: 'Mi a különbség az Admin és Staff szerepkörök között?',
    answer: `**Admin szerepkör** teljes hozzáféréssel:
• Vendégkezelés (hozzáadás, szerkesztés, törlés)
• Fizetés kezelés és jóváhagyás
• Ültetési rend
• Email küldés és sablonok
• Statisztikák és riportok
• Felhasználó kezelés
• Check-in override lehetőséggel

**Staff szerepkör** korlátozott:
• Csak check-in funkció
• QR kód szkennelés
• Manuális vendég keresés
• **Nincs** override duplikált check-innél

Válaszd a Staff-ot az esemény napi önkénteseknek, akiknek csak jegyeket kell szkennelniük.`,
    keywords: ['szerepkör', 'admin', 'staff', 'jogosultság', 'hozzáférés'],
  },

  // ==========================================
  // SYSTEM & TECHNICAL
  // ==========================================
  {
    id: 'tech-roles',
    category: 'System & Technical',
    question: 'Milyen felhasználói szerepkörök vannak?',
    answer: `**Admin**:
• Teljes hozzáférés minden funkcióhoz
• Vendégkezelés, fizetés jóváhagyás
• Ültetés, email küldés, statisztikák
• Check-in override jogosultság

**Staff**:
• Csak check-in funkció
• QR szkennelés és manuális beléptetés
• Nincs override jogosultság

A felhasználók kezelése a Super Admin feladata.`,
    keywords: ['szerepkör', 'role', 'jogosultság', 'permission', 'admin', 'staff'],
  },
  {
    id: 'tech-mobile',
    category: 'System & Technical',
    question: 'Használható mobilról az admin felület?',
    answer: `**Igen, az admin felület mobilbarát!**

**Mobil navigáció**:
• Alsó tab bar: Home, Guests, Seating, Stats, More
• A "More" gombbal eléred a többi funkciót

**Optimalizált oldalak**:
• Check-in oldal: Teljes képernyős QR szkennelés
• Guest List: Görgetés és alapműveletek
• Statistics: KPI kártyák egymás alatt

**Desktop ajánlott**:
• Seating drag & drop (nagyobb képernyő)
• Email template szerkesztés
• CSV import preview`,
    keywords: ['mobil', 'mobile', 'telefon', 'tablet', 'responsive'],
  },
  {
    id: 'tech-security',
    category: 'System & Technical',
    question: 'Hogyan védettek a vendégadatok?',
    answer: `**Biztonsági intézkedések**:

**Hozzáférés védelem**:
• Bejelentkezés szükséges minden admin oldalhoz
• Session timeout inaktivitás után
• Szerepkör alapú jogosultságkezelés

**Adatbiztonság**:
• HTTPS titkosítás minden kommunikációhoz
• Jelszavak bcrypt hash-elve
• Magic link-ek 5 perc után lejárnak

**Fizetési biztonság**:
• Stripe kezeli a kártyaadatokat (PCI-DSS)
• Bankkártya adatok NEM tárolódnak nálunk

**Audit napló**:
• Minden check-in rögzítve
• Email küldések naplózva`,
    keywords: ['biztonság', 'security', 'védelem', 'gdpr', 'adatvédelem'],
  },
  {
    id: 'tech-password',
    category: 'System & Technical',
    question: 'Hogyan változtathatom meg a jelszavam?',
    answer: `Jelszóváltoztatáshoz **keresd a rendszergazdát**.

Biztonsági okokból a jelszókezelés manuálisan történik.

**Kapcsolat**:
📧 admin@ceogala.hu

Kérlek add meg:
• Felhasználóneved
• Miért szeretnéd változtatni
• Megerősítő információ (pl. email)`,
    keywords: ['jelszó', 'password', 'változtatás', 'reset'],
  },
  {
    id: 'tech-support',
    category: 'System & Technical',
    question: 'Hova fordulhatok technikai segítségért?',
    answer: `**Technikai támogatás**:

📧 **Email**: admin@ceogala.hu

**Mielőtt írsz, készítsd elő**:
• Milyen műveletet próbáltál
• Mi történt (hibaüzenet, screenshot)
• Melyik böngészőt használod

**Gyakori megoldások**:
• Frissítsd az oldalt (F5)
• Próbáld másik böngészőben
• Ellenőrizd az internetkapcsolatot
• Töröld a böngésző cache-t`,
    keywords: ['támogatás', 'support', 'segítség', 'help', 'hiba', 'error'],
  },
  {
    id: 'diagram-dashboard-hu',
    category: 'System & Technical',
    question: 'Mi az a Diagram Dashboard?',
    answer: `A **Diagram Dashboard** egy vizuális dokumentációs központ, elérhető az **/admin/diagrams** címen (Test Hub menü).

**28 SVG diagramot tartalmaz** kategóriákba rendezve:
• **Architektúra** (6): Rendszer áttekintés, Tech Stack, DB Séma, API, Biztonság, Komponens Architektúra
• **Folyamatok** (10): Regisztráció, Fizetés, Check-in, Jelentkező folyamatok, Admin vs Staff Szerepkörök
• **Admin UI** (6): Dashboard wireframe-ek és workflow-k
• **Wireframe-ek** (3): Vendég Regisztráció, PWA, Admin Core
• **Teszt esetek** (2): E2E teszt folyamat diagramok
• **Adatfolyam** (1): Email Rate Limiting

**Funkciók**:
• HU/EN nyelv váltás
• Sötét mód támogatás
• Megjegyzések minden diagramhoz (CSV export/import)
• Reszponzív sidebar navigáció`,
    keywords: ['diagram', 'dashboard', 'teszt', 'hub', 'svg', 'dokumentáció', 'folyamat'],
  },
  {
    id: 'email-retry-logic-hu',
    category: 'System & Technical',
    question: 'Hogyan működik az email újrapróbálkozás és korlátozás?',
    answer: `Az email rendszer **automatikus újrapróbálkozást** és **korlátozást** tartalmaz.

**Újrapróbálkozás**:
• 3 kísérlet emailenként
• Exponenciális késleltetés: 1mp → 2mp → 4mp
• Automatikus újrapróbálkozás átmeneti hibáknál

**Korlátozás** (vendégenként):
• **5 email típusonként óránként** (pl. 5 magic link/óra)
• **20 összes email óránként** (minden típus együtt)

**Ha korlátozva vagy**:
• Várj 1 órát és próbáld újra
• Használj tömeges emailt nagy mennyiséghez (automatikusan kezeli a limiteket)

**Minden email naplózva van** az Email Logs oldalon a kézbesítési státusszal.`,
    keywords: ['email', 'újrapróbálkozás', 'retry', 'korlát', 'limit', 'backoff', 'kézbesítés'],
  },
];

// Get guides based on language
export function getAdminGuides(language: 'en' | 'hu'): GuideItem[] {
  return language === 'en' ? adminGuidesEn : adminGuidesHu;
}

// Get UI translations based on language
export function getAdminHelpUI(language: 'en' | 'hu') {
  return adminHelpTranslations[language];
}
