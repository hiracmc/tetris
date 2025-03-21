// ゲームのキャンバス要素を取得し、2D描画コンテキストを設定
const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

// キャンバス内の描画サイズを拡大（20倍）
context.scale(20, 20);

// 各ブロックの形状に対応する色を定義
const colors = {
    'T': '#FF0D72',  // T型ブロックの色
    'O': '#0DC2FF',  // O型ブロックの色
    'L': '#0DFF72',  // L型ブロックの色
    'J': '#F538FF',  // J型ブロックの色
    'I': '#FF8E0D',  // I型ブロックの色
    'S': '#FFE138',  // S型ブロックの色
    'Z': '#3877FF'   // Z型ブロックの色
};

// ブロックの形状を定義する関数
function createPiece(type) {
    if (type === 'T') {
        // T型ブロックの形状
        return [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ];
    } else if (type === 'O') {
        // O型ブロックの形状（正方形）
        return [
            [1, 1],
            [1, 1],
        ];
    } else if (type === 'L') {
        // L型ブロックの形状
        return [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0],
        ];
    } else if (type === 'J') {
        // J型ブロックの形状
        return [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0],
        ];
    } else if (type === 'I') {
        // I型ブロックの形状（棒状）
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'S') {
        // S型ブロックの形状
        return [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        // Z型ブロックの形状
        return [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0],
        ];
    }
}

// ゲームフィールド（アリーナ）の初期化
const arena = createMatrix(12, 20);

// 指定された幅と高さでフィールドを作成
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        // 各行を幅wの0で埋める
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

// ブロックの描画
function drawMatrix(matrix, offset, color) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                // ブロックの色を設定し、キャンバス上に描画
                context.fillStyle = color || value;
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// ゲームフィールドとブロックを描画
function draw() {
    // 背景を黒で塗りつぶす
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // フィールドとプレイヤーのブロックを描画
    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos, player.color);
}

// ブロックがフィールドと衝突しているかどうかを判定
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) !== 0) {
                return true;  // 衝突している
            }
        }
    }
    return false;  // 衝突していない
}

// ブロックが固定されたらフィールドに統合
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = player.color;
            }
        });
    });
}

// ラインが揃った場合に消去
function arenaSweep() {
    outer: for (let y = arena.length - 1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;  // ラインが揃っていない
            }
        }

        // ラインを消去し、スコアを更新
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += 10;
        updateScore();
    }
}

// ブロックを自動で落下させる
function playerDrop() {
    player.pos.y++;  // ブロックを1段下に動かす
    if (coll

ide(arena, player)) {
        player.pos.y--;  // 衝突した場合、位置を戻す
        merge(arena, player);  // フィールドにブロックを統合
        playerReset();  // 新しいブロックを生成
        arenaSweep();  // ラインを消去
    }
    dropCounter = 0;
}

// ブロックの落下速度を制御
let dropCounter = 0;
let dropInterval = 1000;  // 1秒ごとにブロックが落ちる

// 前回のフレームからの経過時間を基に更新
let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);  // フレームごとにゲームを更新
}

// 新しいブロックを生成
function playerReset() {
    const pieces = 'ILJOTSZ';  // 7種類のブロック
    const pieceType = pieces[pieces.length * Math.random() | 0];  // ランダムでブロックを選ぶ
    player.matrix = createPiece(pieceType);  // ブロックの形状を設定
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    player.color = colors[pieceType];  // ブロックの色を設定

    if (collide(arena, player)) {
        // ゲームオーバー時にフィールドをリセット
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

// ブロックを左右に移動
function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;  // 衝突したら元に戻す
    }
}

// ブロックの回転処理
function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

// プレイヤーのブロックを回転
function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);  // 回転を元に戻す
            player.pos.x = pos;
            return;
        }
    }
}

// スコアの更新
function updateScore() {
    document.getElementById('score').innerText = `スコア: ${player.score}`;
}

// キー入力による操作
document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);  // 左移動
    } else if (event.keyCode === 39) {
        playerMove(1);  // 右移動
    } else if (event.keyCode === 40) {
        playerDrop();  // 下移動（高速落下）
    } else if (event.keyCode === 81) {
        playerRotate(-1);  // 左回転
    } else if (event.keyCode === 87) {
        playerRotate(1);  // 右回転
    }
});

// プレイヤーの初期設定
const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
    color: null
};

// ゲーム開始
playerReset();
updateScore();
update();
