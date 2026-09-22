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
        // Preparar mats
        let matGaussian = new cv.Mat();
        let matBlur = new cv.Mat();

        // 1- Aplique GaussianBlur em uma imagem inteira
        let ksizeG = new cv.Size(25, 25);
        cv.GaussianBlur(src, matGaussian, ksizeG, 0, 0, cv.BORDER_DEFAULT);
        cv.imshow('canvasGaussian', matGaussian);

        // 2- Aplique Blur em outra
        let ksizeB = new cv.Size(25, 25);
        cv.blur(src, matBlur, ksizeB, new cv.Point(-1, -1), cv.BORDER_DEFAULT);
        cv.imshow('canvasBlur', matBlur); // Mostrar Blur

        // 3- Corte com máscara um círculo menor na imagem original
        let smallMask = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC1);
        let center = new cv.Point(Math.floor(src.cols / 2), Math.floor(src.rows / 2));
        let smallRadius = Math.floor(Math.min(src.cols, src.rows) / 6);
        cv.circle(smallMask, center, smallRadius, new cv.Scalar(255), -1);
        let smallCut = new cv.Mat();
        cv.bitwise_and(src, src, smallCut, smallMask);
        cv.imshow('canvas3', smallCut);

        // 4- Corte com máscara um círculo maior a imagem GaussianBlur
        let largeMask = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC1);
        let largeRadius = Math.floor(Math.min(src.cols, src.rows) / 3);
        cv.circle(largeMask, center, largeRadius, new cv.Scalar(255), -1);
        let largeCutGaussian = new cv.Mat();
        cv.bitwise_and(matGaussian, matGaussian, largeCutGaussian, largeMask);
        cv.imshow('canvas4', largeCutGaussian);

        // 5- Junte sobre a imagem Blur a etapa 4
        let compositeStep5 = matBlur.clone();
        largeCutGaussian.copyTo(compositeStep5, largeMask);
        cv.imshow('canvas5', compositeStep5);

        // 6- Junte a imagem da etapa 5 a da etapa 3
        let finalComposite = compositeStep5.clone();
        smallCut.copyTo(finalComposite, smallMask);
        cv.imshow('canvas6', finalComposite);

        // Deletar mats
        matGaussian.delete();
        matBlur.delete();
        smallMask.delete();
        largeMask.delete();
        smallCut.delete();
        largeCutGaussian.delete();
        compositeStep5.delete();
        finalComposite.delete();

        statusEl.textContent = 'Conversão concluída!';
    });
};