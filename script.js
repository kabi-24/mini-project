pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

async function readPDF(file) {
    const reader = new FileReader();

    return new Promise(resolve => {
        reader.onload = async () => {
            const pdf = await pdfjsLib.getDocument(new Uint8Array(reader.result)).promise;
            let text = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                content.items.forEach(item => {
                    text += item.str + "\n";
                });
            }
            resolve(text.trim());
        };
        reader.readAsArrayBuffer(file);
    });
}

async function evaluate() {

    const keyFile = document.getElementById("keyPdf").files[0];
    const studentFile = document.getElementById("studentPdf").files[0];

    if (!keyFile || !studentFile) {
        alert("Please upload both PDFs");
        return;
    }

    const keyText = await readPDF(keyFile);
    const studentText = await readPDF(studentFile);

    const keyAnswers = keyText.split("\n");
    const studentAnswers = studentText.split("\n");

    let score = 0;
    let total = keyAnswers.length;

    for (let i = 0; i < total; i++) {
        if (
            studentAnswers[i] &&
            keyAnswers[i].toLowerCase() === studentAnswers[i].toLowerCase()
        ) {
            score++;
        }
    }

    const percent = (score / total) * 100;

    document.getElementById("output").innerHTML =
        `Score: ${score} / ${total}<br>Percentage: ${percent.toFixed(2)}%`;
}
