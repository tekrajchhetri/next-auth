/**
 * <div class="provider" style={{backgroundColor: "#A6CE39", display: "flex", justifyContent: "space-between", color: "#fff", padding: 16}}>
 * <span>Built-in <b>ORCID</b> integration.</span>
 * <a href="https://orcid.org">
 *   <img style={{display: "block"}} src="https://info.orcid.org/wp-content/uploads/2019/11/orcid_16x16.png" height="48" width="48"/>
 * </a>
 * </div>
 *
 * @module providers/orcid
 */
import type { OAuthConfig, OAuthUserConfig } from "./index.js";

interface ORCIDProfile {
  sub: string; // User's ORCID identifier (ORCID iD)
  name?: string; // Optional: Full name
  email?: string; // Optional: Email address
  given_name?: string; // Optional: First name
  family_name?: string; // Optional: Last name
  picture?: string; // Optional: Profile picture or URL
  url?: string; // Optional: ORCID URL
}

/**
 * Add ORCID login to your page.
 *
 * ### Setup
 *
 * #### Callback URL
 * ```
 * https://example.com/api/auth/callback/orcid
 * ```
 *
 * #### Configuration
 *```ts
 * import { Auth } from "@auth/core"
 * import ORCID from "@auth/core/providers/orcid"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     ORCID({
 *       clientId: ORCID_CLIENT_ID,
 *       clientSecret: ORCID_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### Resources
 *
 *  - [ORCID OAuth documentation](https://info.orcid.org/documentation/integration-guide/)
 *
 * ### Notes
 *
 * By default, Auth.js assumes that the ORCID provider is
 * based on the [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) specification.
 *
 * :::info **Disclaimer**
 *
 * If you think you found a bug in the default configuration, you can [open an issue](https://authjs.dev/new/provider-issue).
 *
 * Auth.js strictly adheres to the specification and it cannot take responsibility for any deviation from
 * the spec by the provider.
 *
 * :::
 */
export default function ORCID<P extends ORCIDProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "orcid",
    name: "ORCID",
    type: "oauth",
    authorization: {
      url: "https://orcid.org/oauth/authorize",
      params: {
        scope: "openid email profile",
        response_type: "code",
      },
    },
    token: "https://orcid.org/oauth/token",
    userinfo: {
      // ORCID userinfo endpoint for fetching user details
      url: "https://orcid.org/oauth/userinfo",
      async request({ tokens, provider }) {
        return await fetch(provider.userinfo?.url as URL, {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        }).then(async (res) => await res.json());
      },
    },
    profile(profile: P) {
      return {
        id: profile.sub, // ORCID ID
        name: profile.name || `${profile.given_name || "Unknown"} ${profile.family_name || ""}`.trim(),
        email: profile.email,
        image: profile.picture,
        url: profile.url || `https://orcid.org/${profile.sub}`,
      };
    },
    style: { bg: "#A6CE39", text: "#fff" },
    options,
  };
}

