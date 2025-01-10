export async function login() {
    const hasAccess = await checkScopes();
    if (!hasAccess) {
        window.location.href = "http://localhost:8000/oauth/google";
    }
    return hasAccess;
}

export async function checkScopes() {
    const res = await fetch("http://localhost:8000/oauth/google/check_scopes", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include"
    });
    if (!res.ok) {
        throw new Error("Failed to check Google scopes");
    }
    const hasAccess = await res.json();
    return hasAccess.has_scopes;
}

export async function handleSignOut(callback) {
    window.location.href = "http://localhost:8000/oauth/google/revoke";
    callback();
}

export async function checkLoginStatus() {
    const res = await fetch("http://localhost:8000/oauth/google/check_auth", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include"
    });
    if (!res.ok) {
        throw new Error("Failed to check login status");
    }
    const loggedIn = await res.json();
    return loggedIn;
}