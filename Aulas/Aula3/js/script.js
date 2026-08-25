cv['onRuntimeInitialized'] = function () {
    const inputImagem = document.querySelector('#inputImage');
    const btnContraste = document.querySelector('#btnContraste');
    const statusEl = document.querySelector('#status');
    let src;
    statusEl.textContent = 'OpenCV.js carregado. Selecione uma imagem.';

    inputImagem.addEventListener('change', function (e) {
        if (!e.target.files[0]) return;
        const img = document.createElement('img');
        img.src = URL.createObjectURL(e.target.files[0]);
        img.onload = () => {
            if (src) src.delete();
            src = cv.imread(img);
            cv.imshow('canvasOriginal', src);
            btnContraste.disabled = false;
            statusEl.textContent = 'Imagem Carregada. Clique em Converter!';
        }
    });
    btnContraste.addEventListener('click', function () {
        let ajustada = new cv.Mat();
        // Brilho +50 e Contraste x1.3
        cv.convertScaleAbs(src, ajustada, 1.3, 50);
        cv.imshow('canvasSaida', ajustada);
        ajustada.delete();

        // Recortar Imagem na região de interesse (ROI) --> retângulo
        // ponto inicial (80, 80), largura 300, altura 100
        let rect = new cv.Rect(80, 80, 100, 300);
        let roi = src.roi(rect);
        cv.imshow('canvasRecortar', roi);
        roi.delete();

        // Máscara 
        let mascara = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC1);
        let centro = new cv.Point(src.cols / 2, src.rows / 2);
        let raio = Math.min(src.cols, src.rows) / 3;
        cv.circle(mascara, centro, raio, new cv.Scalar(255), -1);
        cv.imshow('canvasMascara', mascara);

        // recorte com AND
        let recorte = new cv.Mat();
        cv.bitwise_and(src, src, recorte, mascara);
        cv.imshow('canvasAnd', recorte);

        // recorte com XOR
        let diff = new cv.Mat();
        cv.bitwise_xor(src, recorte, diff);
        cv.imshow('canvasXor', diff);

        // recorte com OR
        let recorteOr = new cv.Mat();
        cv.bitwise_or(src, recorte, recorteOr);
        cv.imshow('canvasOr', recorteOr);

        recorte.delete();
        recorteOr.delete();
        diff.delete();
        mascara.delete();

        statusEl.textContent = 'Conversão concluída!';
    })
};