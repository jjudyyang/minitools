import os
import smtplib
from email.message import EmailMessage
from collections import Counter
import argparse

# Helper to list subfolders and files
def list_subfolders_and_files(folder_path):
    entries = os.listdir(folder_path)
    subfolders = [f for f in entries if os.path.isdir(os.path.join(folder_path, f))]
    files = [f for f in entries if os.path.isfile(os.path.join(folder_path, f)) and not f.startswith('.')]
    return subfolders, files

def send_bulk_emails(folder_path, recipient_email, sender_email, sender_password):
    supported_extensions = ['.pdf', '.jpg', '.jpeg', '.png', '.csv', '.xlsx', '.eml', '.txt']
    files = [f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f)) and not f.startswith('.')]
    valid_files = [f for f in files if os.path.splitext(f)[1].lower() in supported_extensions]
    # Identify unsupported files
    unsupported_files = [f for f in files if os.path.splitext(f)[1].lower() not in supported_extensions]
    if not valid_files:
        print("No valid files found in the directory.")
        return

    # Count files by extension
    ext_counts = Counter([os.path.splitext(f)[1].lower() for f in valid_files])

    failed_files = []
    for file in valid_files:
        file_path = os.path.join(folder_path, file)
        file_name, file_ext = os.path.splitext(file)
        file_ext = file_ext.lower()

        msg = EmailMessage()
        msg['From'] = sender_email
        msg['To'] = recipient_email
        # Set subject for all files, including .eml
        msg['Subject'] = f"For {file}"
        if file_ext != '.eml':
            msg.set_content('')  # No body text

        try:
            with open(file_path, 'rb') as f:
                file_data = f.read()
                maintype = 'application'
                subtype = 'octet-stream'

                if file_ext in ['.jpg', '.jpeg', '.png']:
                    maintype = 'image'
                    subtype = file_ext[1:]
                elif file_ext == '.pdf':
                    subtype = 'pdf'
                elif file_ext == '.csv':
                    subtype = 'csv'
                elif file_ext == '.xlsx':
                    subtype = 'vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                elif file_ext == '.eml':
                    subtype = 'eml'
                elif file_ext == '.txt':
                    subtype = 'plain'

                msg.add_attachment(file_data, maintype=maintype, subtype=subtype, filename=file)

            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
                smtp.login(sender_email, sender_password)
                smtp.send_message(msg)
                print(f"Sent: {file}")
        except Exception as e:
            print(f"Failed to send: {file} ({file_ext}) - {e}")
            failed_files.append((file, file_ext))

    print(f"All {len(valid_files)} emails sent successfully to {recipient_email}.")
    print("Breakdown by file type:")
    for ext, count in ext_counts.items():
        print(f"  {ext}: {count}")
    if failed_files:
        print("\nFiles that failed to send:")
        for file, ext in failed_files:
            print(f"  {file} ({ext})")
    else:
        print("\nAll files sent successfully.")
    if unsupported_files:
        print("\nFiles found but not sent (unsupported file types):")
        for file in unsupported_files:
            ext = os.path.splitext(file)[1].lower()
            print(f"  {file} ({ext})")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Send bulk emails with attachments from a folder.')
    parser.add_argument('--folder', type=str, default='/Users/judy/Desktop/Kohls', help='Path to the folder containing files to send')
    parser.add_argument('--recipient', type=str, default='kohl@orders.usepepper.ai', help='Recipient email address')
    parser.add_argument('--no-confirm', action='store_true', help='Send without interactive confirmation')
    args = parser.parse_args()

    sender = 'judy.yang@usepepper.com'
    password = 'vsarndiixleeiioz'

    if args.no_confirm:
        send_bulk_emails(args.folder, args.recipient, sender, password)
    else:
        # Interactive folder selection
        base_folder = args.folder
        while True:
            subfolders, files = list_subfolders_and_files(base_folder)
            print(f"\nCurrent folder: {base_folder}")
            print("Subfolders:")
            for idx, sub in enumerate(subfolders):
                print(f"  [{idx}] {sub}")
            print("Files:")
            for f in files:
                print(f"  {f}")
            print("\nType the number of a subfolder to enter it, or press Enter to select this folder for sending.")
            choice = input("Your choice: ").strip()
            if choice == '':
                break
            elif choice.isdigit() and int(choice) < len(subfolders):
                base_folder = os.path.join(base_folder, subfolders[int(choice)])
            else:
                print("Invalid choice. Please try again.")

        # Preview files to be sent
        print(f"\nFiles to be sent from: {base_folder}")
        preview_files = [f for f in os.listdir(base_folder) if os.path.isfile(os.path.join(base_folder, f)) and not f.startswith('.')]
        for f in preview_files:
            print(f"  {f}")
        confirm = input("\nProceed to send these files? (y/n): ").strip().lower()
        if confirm == 'y':
            send_bulk_emails(base_folder, args.recipient, sender, password)
        else:
            print("Aborted by user.")
