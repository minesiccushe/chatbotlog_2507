document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.querySelector('.chat-container');

    /**
     * 表示されているすべてのツールチップを閉じる関数
     */
    function closeAllTooltips() {
        document.querySelectorAll('.tooltip-content.show').forEach(tooltip => {
            tooltip.classList.remove('show');
        });
    }

    // ドキュメント全体をクリックしたときに、表示されているツールチップを閉じる
    document.addEventListener('click', closeAllTooltips);

    // JSONファイルを非同期で読み込む
    fetch('./log.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // 読み込んだデータからチャットを生成
            if (data && data.log) {
                generateChat(data.log);
            }
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            chatContainer.innerHTML = '<p style="color: red; text-align: center;">チャットログの読み込みに失敗しました。</p>';
        });

    /**
     * チャットログデータからHTMLを生成して表示する
     * @param {Array} log - チャットログの配列
     */
    function generateChat(log) {
        log.forEach(item => {
            let element;
            if (item.type === 'separator') {
                element = createSeparator(item);
            } else if (item.type === 'message') {
                element = createMessage(item);
            }
            if (element) {
                chatContainer.appendChild(element);
            }
        });
    }

    /**
     * 日付区切り要素を生成する
     * @param {object} item - 日付区切りデータ
     * @returns {HTMLElement}
     */
    function createSeparator(item) {
        const separator = document.createElement('div');
        separator.className = 'date-separator';
        separator.textContent = item.text;
        return separator;
    }

    /**
     * メッセージ要素を生成する
     * @param {object} item - メッセージデータ
     * @returns {HTMLElement}
     */
    function createMessage(item) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${item.sender === 'my' ? 'my-message' : 'partner-message'}`;

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';

        const content = item.content;
        if (content.type === 'text') {
            bubbleDiv.innerHTML = content.body;
        } else if (content.type === 'image') {
            bubbleDiv.classList.add('img');
            bubbleDiv.innerHTML = `
                <div class="message-image">
                    <a href="${content.path}" target="_blank">
                        <img src="${content.path}">
                    </a>
                </div>
            `;
        }

        // --- ここからツールチップ機能の追加 ---
        if (item.sender === 'partner' && content.tooltips) {
            // ツールチップのトリガーとなる要素（？アイコン）を生成
            const tooltipTrigger = document.createElement('span');
            tooltipTrigger.className = 'tooltip-trigger';
            tooltipTrigger.textContent = '?';

            // ツールチップ本体の要素を生成
            const tooltipContent = document.createElement('div');
            tooltipContent.className = 'tooltip-content';
            // textContentではなくinnerHTMLを使用してHTMLタグを解釈する
            tooltipContent.innerHTML = content.tooltips;

            // トリガーをクリックしたときのイベントリスナーを設定
            tooltipTrigger.addEventListener('click', (event) => {
                // ドキュメントのクリックイベントが発火しないように伝播を停止
                event.stopPropagation();
                
                const isCurrentlyVisible = tooltipContent.classList.contains('show');
                
                // 他に開いているツールチップがあれば全て閉じる
                closeAllTooltips();
                
                // もしクリックしたツールチップが非表示だったら表示する（トグル動作）
                if (!isCurrentlyVisible) {
                    tooltipContent.classList.add('show');
                }
            });

            // 生成した要素をメッセージバブルに追加
            bubbleDiv.appendChild(tooltipTrigger);
            bubbleDiv.appendChild(tooltipContent);
        }
        // --- ここまでツールチップ機能の追加 ---

        messageDiv.appendChild(bubbleDiv);
        return messageDiv;
    }
});