// SessionService.ts
export class SessionService {
    createSession(userId: string): string {
        return `session_${userId}_${Date.now()}`;
    }
}
