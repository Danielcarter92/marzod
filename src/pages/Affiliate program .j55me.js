```javascript
import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import wixWindow from 'wix-window';
import { generateInviteCode } from 'backend/wix-affiliate';

$w.onReady(() => {
    $w('#shareInviteButton').onClick(async () => {
        const currentUser = wixUsers.currentUser;
        const userId = currentUser.id;

        generateInviteCode(userId)
            .then((response) => {
                if (response.success) {
                    const inviteLink = `${wixLocation.baseUrl}?ref=${response.code}`;
                    $w('#inviteLinkInput').value = inviteLink;
                } else {
                    console.error("Error generating invite code:", response.error);
                }
            })
            .catch((error) => {
                console.error("Error generating invite link:", error);
            });
    });

    $w('#copyInviteButton').onClick(() => {
        const inviteLink = $w('#inviteLinkInput').value;
        if (inviteLink) {
            wixWindow.copyToClipboard(inviteLink)
                .then(() => {
                    console.log("Invite link copied to clipboard!");
                })
                .catch((err) => {
                    console.error("Failed to copy invite link: ", err);
                });
        }
    });
});
```

