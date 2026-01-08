pdfjsLib.GlobalWorkerOptions.workerSrc =
 "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

async function extractText(file) {
    const reader = new FileReader();
    return new Promise(resolve => {
        reader.onload = async () => {
            const pdf = await pdfjsLib.getDocument(new Uint8Array(reader.result)).promise;
            let text = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                content.items.forEach(item => text += item.str + "\n");
            }
            resolve(text.trim());
        };
        reader.readAsArrayBuffer(file);
    });
}

function similarity(model, student) {
    const m = model.toLowerCase().split(" ");
    const s = student.toLowerCase().split(" ");
    let match = 0;
    m.forEach(w => { if (s.includes(w)) match++; });
    return match / m.length;
}

async function evaluate() {
    const keyPdf = document.getElementById("keyPdf").files[0];
    const studentPdf = document.getElementById("studentPdf").files[0];

    if (!keyPdf || !studentPdf) {
        alert("Please upload both PDFs");
        return;
    }

    const keyText = await extractText(keyPdf);
    const studentText = await extractText(studentPdf);

    const keyLines = keyText.split("\n");
    const studentLines = studentText.split("\n");

    let total = 0, score = 0;
    let html = "<h3>Evaluation Result</h3>";

    keyLines.forEach((line, i) => {
        const [q, marks, model] = line.split("|");
        const student = studentLines[i]?.split("|")[1] || "";

        const s = similarity(model, student) * parseInt(marks);
        total += parseInt(marks);
        score += s;

        html += `Q${i+1}: ${s.toFixed(2)} / ${marks}<br>`;
    });

    html += `<br><b>Total Score:</b> ${score.toFixed(2)} / ${total}`;
    document.getElementById("result").innerHTML = html;
}