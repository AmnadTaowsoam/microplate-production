## Prompt: ออกแบบสถาปัตยกรรมระบบ Microplate AI (Computer Vision + Cobot + Labware Integration)

คุณคือที่ปรึกษาด้านสถาปัตยกรรมระบบ AI และ Micro-services กรุณาช่วยออกแบบและสรุปรายละเอียดของโครงการ Microplate AI ซึ่งประกอบด้วยการควบคุม Cobot, การสแกน QR, การอ่านผลด้วย Computer Vision, การเก็บข้อมูลในฐานข้อมูล และการเชื่อมต่อกับระบบ Labware ตามข้อกำหนดต่อไปนี้

---

### 1. ภาพรวมโปรเจกต์
- **ชื่อโครงการ**: Microplate AI System  
- **จุดประสงค์**: ใช้ภาพจากกล้องอ่านผลบน Microplate แทนคน  
- **องค์ประกอบหลัก**:  
  - Cobot (Dobot MG400)  
  - กล้องสแกน QR + ถ่ายภาพ  
  - Backend (API Gateway, Micro-services)  
  - Frontend (Next.js + TypeScript + MUI)  
  - ฐานข้อมูล PostgreSQL + Redis  

### 2. สิ่งที่ต้องการให้ AI ช่วยออกแบบ
1. **โครงสร้าง Micro-service**  
   - แนะนำบริการ (services) แต่ละตัว พร้อมโครงสร้างโฟลเดอร์  
   - ชื่อบริการ (Service Name) ให้กระชับ สื่อความหมาย  
2. **API Design**  
   - กำหนดแต่ละ Endpoint: URL, HTTP method, Request/Response schema  
   - แสดงตัวอย่าง payload (JSON)  
3. **Cobot Status Model**  
   - ระบุสถานะ (states) ทั้งหมดที่ Cobot จะส่งกลับ เช่น `IDLE`, `MOVING`, `PICKED`, `SCANNING`, `PLACED`, `ERROR`  
4. **Workflow Sequence**  
   - เรียงขั้นตอนการทำงาน (Flow) ตั้งแต่ Frontend → Cobot → Camera → Predictor → Database → Labware  
   - กำหนดเงื่อนไข retry / error handling  
5. **Integration กับระบบ Labware**  
   - กระบวนการ Login/Token management (เก็บ-ต่ออายุ token ใน Redis)  
   - Endpoint สำหรับส่งผลทดสอบไปยัง Labware  
6. **ไฟล์ Markdown สรุป**  
   - สร้างเอกสารสรุปทั้งหมดในรูปแบบ Markdown ที่พร้อมแชร์  
7. **Tool Stack & Infrastructure**  
   - แนะนำเทคโนโลยีหลัก: Next.js, TypeScript, MUI, Node.js (หรือ Python), PostgreSQL, Redis  
   - เสริมเทคโนโลยีที่ช่วยเรื่อง CI/CD, Containerization (Docker, Kubernetes), Logging/Monitoring, Testing, Security  
   - แนะนำวิธีจัดการ Environment Variables, Secrets, Configuration  

### 3. สิ่งที่ควรเพิ่มเติม (Quality of Service)
- **Error Handling & Retry Policy**: กรณี Camera/Prediction/Network ล้มเหลว  
- **Logging & Monitoring**: เช่น ELK, Prometheus + Grafana  
- **Authentication & Authorization**: JWT, RBAC  
- **CI/CD Pipeline**: GitHub Actions หรือ GitLab CI  
- **Containerization & Deployment**: Docker Compose หรือ Kubernetes (Helm charts)  
- **Scalability & Resilience**: Auto-scaling, Circuit Breaker  

---

**โปรดตอบกลับโดยตรงเป็นไฟล์ Markdown** (พร้อมโครงสร้างหัวข้อ และโค้ดตัวอย่างสำหรับ API) เพื่อที่ผมจะได้ใช้ต่อในขั้นตอนออกแบบและพัฒนา  

