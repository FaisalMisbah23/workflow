# Security

If you discover a security vulnerability, please do not open a public issue.
Contact the repository owner or maintainer directly and rotate any exposed keys
immediately.

Recommended steps if a secret was accidentally committed:
1. Remove the secret from the repository and add the path to `.gitignore`.
2. Rotate the secret at the provider immediately.
3. If the secret appears in history, consider using BFG or `git filter-repo` to purge it, then force-push.
