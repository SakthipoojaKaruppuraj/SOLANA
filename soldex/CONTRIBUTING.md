# Contributing to SOLDex

We welcome contributions from the open-source community to improve the SOLDex AMM protocol.

---

## 💻 Development Workflow

### 1. Fork and Clone
Fork the repository on GitHub, then clone it locally:
```bash
git clone https://github.com/your-username/soldex.git
cd soldex
```

### 2. Set Up Environment
Follow the instructions in the [README.md](README.md) to set up Rust, Solana, Anchor, and Node.js.

### 3. Create a Feature Branch
Use a descriptive name for your feature branch:
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-name
```

---

## 🎨 Coding Standards

### Frontend (TypeScript / React)
* **Code Style**: Code is automatically formatted using Prettier. Run formatting before committing:
  ```bash
  npm run format
  ```
* **Linting**: Ensure code passes linting checks with zero warnings:
  ```bash
  npm run lint
  ```
* **Types**: Explicitly define types and avoid using `any` unless absolutely necessary (e.g. for dynamic Anchor IDL account queries).

### Smart Contract (Rust / Anchor)
* **Formatting**: Format Rust source files using `rustfmt`:
  ```bash
  cargo fmt
  ```
* **Linting / Clippy**: Run Rust clippy checks to find potential bugs or style issues:
  ```bash
  cargo clippy --all-targets
  ```
* **Documentation**: Document all public contexts, error enums, and structures in code using Rust doc comments (`///`).

---

## 🧪 Testing Requirements

* **Anchor Tests**: Any changes to the smart contract processor, helper states, or contexts **must** have corresponding integration tests under the `tests/` directory. Run tests:
  ```bash
  anchor test
  ```
* **Frontend Builds**: Verify that the production build completes successfully:
  ```bash
  cd frontend
  npm run build
  ```

---

## 🚀 Pull Request Checklist

Before submitting a Pull Request, ensure:
1. All linting and formatting checks pass.
2. Local compilation completes successfully without warnings.
3. Relevant unit/integration tests are added and pass.
4. You have updated documentation to reflect any user-facing changes.
