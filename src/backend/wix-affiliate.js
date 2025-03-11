```javascript
import wixData from 'wix-data';
import { currentUser } from 'wix-users-backend';

// Collection names for affiliate tracking
const AFFILIATE_COLLECTION = 'Affiliates';
const REFERRAL_COLLECTION = 'Referrals';
const EXISTING_USER_COLLECTION = 'ExistingUsers';

// Function to generate a unique invite code
function generateUniqueCode() {
    return Math.random().toString(36).substr(2, 8);
}

// Generate a unique invite code for a user
export async function generateInviteCode() {
    try {
        // Get current user ID
        const userId = await currentUser.get().then(user => user.email);

        // Check if user already has an invite code
        const result = await wixData.query(AFFILIATE_COLLECTION)
            .eq('userId', userId)
            .find();

        if (result.items.length > 0) {
            return {
                success: true,
                code: result.items[0].inviteCode
            };
        }
        
        // Generate new unique code
        const code = generateUniqueCode();
        
        // Insert new affiliate record into database
        await wixData.insert(AFFILIATE_COLLECTION, {
            userId: userId,
            inviteCode: code,
            createdDate: new Date(),
            totalReferrals: 0,
            pendingRewards: 0,
            paidRewards: 0
        });
        
        return {
            success: true,
            code: code
        };
    } catch (error) {
        console.error("Error generating invite code:", error);
        return {
            success: false,
            error: "Failed to generate invite code"
        };
    }
}

// Track a new referral
export async function trackReferral(inviteCode) {
    try {
        const result = await wixData.query(AFFILIATE_COLLECTION)
            .eq("inviteCode", inviteCode)
            .find();
        
        if (result.items.length === 0) {
            return {
                success: false,
                error: "Invalid invite code"
            };
        }
        
        const referrerData = result.items[0];
        const newUser = await currentUser.get().then(user => user.email);
        
        // Check if user was already referred
        const existingReferral = await wixData.query(REFERRAL_COLLECTION)
            .eq("referredUser", newUser)
            .find();
            
        if (existingReferral.items.length > 0) {
            return {
                success: false,
                error: "User already referred"
            };
        }
        
        // Insert new referral record
        await wixData.insert(REFERRAL_COLLECTION, {
            referrerId: referrerData.userId,
            referredUser: newUser,
            dateReferred: new Date(),
            status: "pending"
        });
        
        // Update affiliate stats
        referrerData.totalReferrals += 1;
        referrerData.pendingRewards += 10; // $10 per referral
        await wixData.update(AFFILIATE_COLLECTION, referrerData);
        
        return {
            success: true
        };
    } catch (error) {
        console.error("Error tracking referral:", error);
        return {
            success: false,
            error: "Failed to track referral"
        };
    }
}

// Get affiliate stats for current user
export async function getAffiliateStats() {
    try {
        const userId = await currentUser.get().then(user => user.email);
        
        const result = await wixData.query(AFFILIATE_COLLECTION)
            .eq("userId", userId)
            .find();
            
        if (result.items.length === 0) {
            return {
                success: true,
                stats: {
                    totalReferrals: 0,
                    pendingRewards: 0,
                    paidRewards: 0,
                    inviteCode: null
                }
            };
        }
        
        return {
            success: true,
            stats: result.items[0]
        };
    } catch (error) {
        console.error("Error fetching affiliate stats:", error);
        return {
            success: false,
            error: "Failed to fetch affiliate stats"
        };
    }
}
```
