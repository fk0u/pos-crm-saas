# Core Engineering & Delivery Team

Project: **SaaS POS + CRM + Central Sales Monitoring**  
Repository: [fk0u/pos-crm-saas](https://github.com/fk0u/pos-crm-saas)

| Name / Handle | Role | Primary Responsibility in Project |
| :--- | :--- | :--- |
| **Ghani** ([@fk0u](https://github.com/fk0u)) | **Project Owner & Solo Lead Dev** | Decision maker, code execution, stakeholder reporting. |
| **Sekretaris** | **Coordinator & Delivery Guard** | Triage, sprint tracking, scope enforcement, and reporting. |
| **Bevy** | **Chief Technology Officer (CTO)** | System architecture (PSD), PostgreSQL multi-tenancy, Reverb real-time engine. |
| **Lixu** | **Senior Software Engineer (SWE)** | Core Laravel implementation, POS checkout flow, CRM loyalty points engine. |
| **Austin** | **Staff Reviewer & QA Lead** | Code quality gate, security audit, edge-case testing, PR review. |
| **Design & Motion Critic** | **UI/UX Design Lead** | Tablet-friendly POS ergonomics, fast numpad flow, owner mobile analytics UI. |
| **Abang DevOps** | **DevOps & Infrastructure** | Docker compose, PostgreSQL connection tuning, Redis, VPS deployment & CI/CD. |
| **Client Ops** | **Product & Business Operations** | PRD scoping, user personas, client/SME feedback loops. |

---

## Team Workflow & Delivery Sequence
```
[Client Ops / Ghani] -> PRD & Business Scope
         |
         v
     [Bevy CTO]       -> Technical Blueprint & Architecture (PSD)
         |
         v
     [Lixu SWE]       -> Production Code & Migrations
         |
         v
  [Austin Reviewer]   -> Code Quality & Bug Gate
         |
         v
   [Abang DevOps]     -> Deployment & Server Hardening
```
