class FaceSwapApp {
    constructor() {
        this.faceFile = null;
        this.videoFile = null;
        this.isProcessing = false;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateUI();
    }

    bindEvents() {
        // File inputs
        document.getElementById('faceInput').addEventListener('change', (e) => this.handleFileSelect(e, 'face'));
        document.getElementById('videoInput').addEventListener('change', (e) => this.handleFileSelect(e, 'video'));

        // Upload areas
        document.getElementById('faceUpload').addEventListener('click', () => this.clickInput('face'));
        document.getElementById('videoUpload').addEventListener('click', () => this.clickInput('video'));

        // Process button
        document.getElementById('processBtn').addEventListener('click', () => this.processFaceSwap());

        // Result actions
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadResult());
        document.getElementById('shareBtn').addEventListener('click', () => this.shareResult());
        document.getElementById('newSwapBtn').addEventListener('click', () => this.reset());

        // Drag & drop
        this.setupDragDrop();
    }

    clickInput(type) {
        const input = document.getElementById(type === 'face' ? 'faceInput' : 'videoInput');
        input.click();
    }

    handleFileSelect(e, type) {
        const file = e.target.files[0];
        if (file) {
            this.setFile(file, type);
        }
    }

    setFile(file, type) {
        if (type === 'face') {
            this.faceFile = file;
            this.showPreview(file, 'face');
            this.updateFileInfo(file, 'face');
        } else {
            this.videoFile = file;
            this.showPreview(file, 'video');
            this.updateFileInfo(file, 'video');
        }
        this.updateUI();
    }

    showPreview(file, type) {
        const preview = document.getElementById(type === 'face' ? 'facePreview' : 'videoPreview');
        const reader = new FileReader();

        reader.onload = (e) => {
            if (type === 'face') {
                preview.src = e.target.result;
                preview.style.display = 'block';
            } else {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }
        };

        if (type === 'face') {
            reader.readAsDataURL(file);
        } else {
            reader.readAsDataURL(file);
        }
    }

    updateFileInfo(file, type) {
        const infoEl = document.getElementById(type === 'face' ? 'faceInfo' : 'videoInfo');
        const size = (file.size / 1024 / 1024).toFixed(2);
        infoEl.innerHTML = `
            <strong>${file.name}</strong><br>
            ${size} MB • ${file.type}
        `;
        infoEl.style.display = 'block';
    }

    updateUI() {
        const processBtn = document.getElementById('processBtn');
        const hasFace = !!this.faceFile;
        const hasVideo = !!this.videoFile;

        processBtn.disabled = !hasFace || !hasVideo || this.isProcessing;
        
        if (this.isProcessing) {
            processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Memproses...</span>';
        } else {
            processBtn.innerHTML = '<i class="fas fa-magic"></i><span>Swap Wajah</span>';
        }
    }

    const response = await fetch('https://faceswap-backend-production.up.railway.app/api/faceswap', {
        if (!this.faceFile || !this.videoFile) return;

        this.isProcessing = true;
        this.updateUI();

        try {
            this.updateStatus('Mengunggah file...', 10);

            // Simulate upload progress
            const formData = new FormData();
            formData.append('face_image', this.faceFile);
            formData.append('target_video', this.videoFile);

            // Using free Replicate API (ganti dengan API key Anda)
            const response = await fetch('https://api.replicate.com/v1/predictions', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + this.getReplicateAPIKey(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    version: "35454b1b272d4fb2f7a7a69c0b1e1e76f7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
                    input: {
                        source_image: await this.fileToBase64(this.faceFile),
                        target_video: await this.fileToBase64(this.videoFile),
                        // Tambahkan parameter lain sesuai model
                    }
                })
            });

            this.updateStatus('Memproses face swap...', 50);

            const prediction = await response.json();
            const resultUrl = prediction.output;

            this.updateStatus('Mengunduh hasil...', 90);

            // Load result video
            const resultVideo = document.getElementById('resultVideo');
            resultVideo.src = resultUrl;
            document.getElementById('resultSection').style.display = 'block';
            
            this.updateStatus('Selesai!', 100);

        } catch (error) {
            console.error('Error:', error);
            this.updateStatus('Error: ' + error.message, 0);
            alert('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            this.isProcessing = false;
            this.updateUI();
        }
    }

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    getReplicateAPIKey() {
        // Ganti dengan API key Replicate Anda (gratis $10 credit)
        // Daftar di: https://replicate.com/account/api-tokens
        return 'r8_4NKXGtHHwwdM0bfSPaLFOdmUm6ta3KJ1Ofz69';
    }

    updateStatus(text, progress) {
        document.getElementById('statusText').textContent = text;
        document.getElementById('progressFill').style.width = progress + '%';
    }

    downloadResult() {
        const video = document.getElementById('resultVideo');
        const link = document.createElement('a');
        link.href = video.src;
        link.download = 'faceswap_result.mp4';
        link.click();
    }

    shareResult() {
        if (navigator.share) {
            navigator.share({
                title: 'FaceSwap AI Result',
                text: 'Check out my face swap result!',
                url: window.location.href
            });
        } else {
            alert('Fitur share tidak tersedia di browser ini');
        }
    }

    reset() {
        this.faceFile = null;
        this.videoFile = null;
        this.isProcessing = false;
        
        // Reset previews
        document.getElementById('facePreview').style.display = 'none';
        document.getElementById('videoPreview').style.display = 'none';
        document.getElementById('faceInfo').style.display = 'none';
        document.getElementById('videoInfo').style.display = 'none';
        document.getElementById('resultSection').style.display = 'none';
        
        this.updateUI();
        this.updateStatus('Siap digunakan', 0);
    }

    setupDragDrop() {
        const dragOverlay = document.getElementById('dragOverlay');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            document.addEventListener(eventName, () => dragOverlay.classList.add('show'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            document.addEventListener(eventName, () => dragOverlay.classList.remove('show'), false);
        });

        document.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleDroppedFiles(files);
        }, false);
    }

    handleDroppedFiles(files) {
        for (let file of files) {
            if (file.type.startsWith('image/') && !this.faceFile) {
                this.setFile(file, 'face');
            } else if (file.type.startsWith('video/') && !this.videoFile) {
                this.setFile(file, 'video');
            }
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FaceSwapApp();
});
