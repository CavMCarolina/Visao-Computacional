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
            statusEl.textContent = 'Imagem Carregada. Clique em Contar!';
        }
    });
    btnContraste.addEventListener('click', function () {
        // Etapa 1 - Blur
        let blur = new cv.Mat();
        let ksize = new cv.Size(25, 25);
        cv.blur(src, blur, ksize, new cv.Point(-1, -1), cv.BORDER_DEFAULT);
        cv.imshow('canvasBlur', blur);

        // Etapa 2 - Cinza
        let cinza = new cv.Mat();
        cv.cvtColor(blur, cinza, cv.COLOR_RGBA2GRAY);
        cv.imshow('canvasCinza', cinza);

        // Etapa 3 - Binário
        let binaria = new cv.Mat();
        cv.threshold(cinza, binaria, 150, 255, cv.THRESH_BINARY_INV);
        cv.imshow('canvasBinario', binaria);

        // Identificar cada tic tac antes da erosão
        let elemento = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(3, 3));

        // Etapa 4 - Fazer erosão em cada elemento
        let erosao = new cv.Mat();
        cv.erode(binaria, erosao, elemento, new cv.Point(-1, -1), 2);
        cv.imshow('canvasErosao', erosao);

        // Etapa 5 - Contagem
        let contornos = new cv.MatVector();
        let hierarquia = new cv.Mat();
        cv.findContours(erosao, contornos, hierarquia, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        let qtdElementos = 0;
        const areaMinima = 50;

        for (let i = 0; i < contornos.size(); i++) {
            const contorno = contornos.get(i);
            const area = cv.contourArea(contorno, false);
            if (area > areaMinima) {
                qtdElementos++;
            }
        }

        // Deletar mats
        blur.delete();
        cinza.delete();
        binaria.delete();
        elemento.delete();
        erosao.delete();
        contornos.delete();
        hierarquia.delete();

        statusEl.textContent = `Contagem concluída! Foram encontrados ${qtdElementos} elementos.`;
    });
};