#!/bin/bash
set -euo pipefail

# 切换到脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 设置内容同步变量
sourcePath="/Users/huanggaoxiang/Library/Mobile Documents/iCloud~md~obsidian/Documents/Dev/Blogs" # Obsidian 博客路径
imagesPath="/Users/huanggaoxiang/Library/Mobile Documents/iCloud~md~obsidian/Documents/Dev/Attachment" # Obsidian 附件路径
destinationPath="./content/blog" # Next.js 博客内容路径
publicImagesPath="./public/blog-images" # 博客图片公共路径

# 检查必需的命令
for cmd in git rsync npm sed; do
    if ! command -v $cmd &> /dev/null; then
        echo "$cmd 未安装或不在 PATH 中。"
        exit 1
    fi
done

# 步骤 1: 从 Obsidian 同步博客到 Next.js 内容文件夹
echo "正在从 Obsidian 同步博客..."

if [ ! -d "$sourcePath" ]; then
    echo "源路径不存在: $sourcePath"
    exit 1
fi

# 如果博客目录不存在则创建
mkdir -p "$destinationPath"
mkdir -p "$publicImagesPath"

# 清空目标目录
rm -rf "$destinationPath"/*

# 复制博客文件并将 .md 文件直接复制为 .mdx
echo "正在复制博客文件..."
find "$sourcePath" -type f -name "*.md" | while read -r source_file; do
    # 获取相对路径
    relative_path="${source_file#$sourcePath/}"
    # 将 .md 扩展名改为 .mdx
    target_file="$destinationPath/${relative_path%.md}.mdx"
    # 创建目标目录
    mkdir -p "$(dirname "$target_file")"
    # 复制文件
    cp "$source_file" "$target_file"
    echo "复制: $relative_path -> ${relative_path%.md}.mdx"
done

# 复制其他非 .md 文件
find "$sourcePath" -type f ! -name "*.md" ! -path "*/attachments/*" | while read -r source_file; do
    relative_path="${source_file#$sourcePath/}"
    target_file="$destinationPath/$relative_path"
    mkdir -p "$(dirname "$target_file")"
    cp "$source_file" "$target_file"
    echo "复制: $relative_path"
done

# 步骤 2: 同步图片附件到 public 目录
echo "正在同步图片附件..."
if [ -d "$imagesPath" ]; then
    rsync -av --delete "$imagesPath/" "$publicImagesPath/"
    echo "图片附件同步完成"
else
    echo "附件路径不存在，跳过图片同步: $imagesPath"
fi

# 步骤 3: 处理 Markdown 文件
echo "正在处理 Markdown 文件..."

# 函数：提取第一张图片并添加到 frontmatter
process_markdown_files() {
    find "$destinationPath" -name "*.mdx" -type f | while read -r mdx_file; do
        
        # 提取第一张图片
        first_image=$(grep -o '!\[\[.*\]\]' "$mdx_file" | head -n 1 | sed 's/!\[\[\(.*\)\]\]/\1/')
        
        if [ -n "$first_image" ]; then
            # 保留完整的文件名（包括扩展名）
            image_name=$(basename "$first_image")
            
            # 检查 frontmatter 是否存在
            if head -n 1 "$mdx_file" | grep -q "^---$"; then
                # 如果已有 frontmatter，检查是否有 image 属性
                if ! grep -q "^image:" "$mdx_file"; then
                    # 找到第二个 --- 并在其前面添加 image 属性
                    temp_file=$(mktemp)
                    awk -v image_path="/blog-images/$image_name" '
                    BEGIN { in_frontmatter = 0; added_image = 0 }
                    /^---$/ { 
                        if (in_frontmatter == 0) {
                            in_frontmatter = 1
                            print $0
                        } else if (in_frontmatter == 1 && added_image == 0) {
                            print "image: " image_path
                            print $0
                            added_image = 1
                        } else {
                            print $0
                        }
                        next
                    }
                    { print $0 }
                    ' "$mdx_file" > "$temp_file"
                    mv "$temp_file" "$mdx_file"
                fi
            else
                # 如果没有 frontmatter，创建一个
                temp_file=$(mktemp)
                {
                    echo "---"
                    echo "title: $(basename "$mdx_file" .mdx)"
                    echo "date: $(date +'%Y-%m-%d')"
                    echo "image: /blog-images/$image_name"
                    echo "---"
                    echo ""
                    cat "$mdx_file"
                } > "$temp_file"
                mv "$temp_file" "$mdx_file"
            fi
        else
            # 如果没有图片，只重命名文件
            echo "文件 $mdx_file 中未找到图片"
        fi
        
        # 转换 wiki 链接为绝对路径 markdown 图片链接
        sed -i '' 's/!\[\[\([^]]*\)\]\]/![](\/blog-images\/\1)/g' "$mdx_file"
    done
}

process_markdown_files

# 步骤 4: 构建 Next.js 站点
echo "正在构建 Next.js 站点..."
if ! npm run build; then
    echo "Next.js 构建失败。"
    exit 1
fi

# 步骤 5: 检查更改并暂存
echo "正在检查更改..."
if git diff --quiet && git diff --cached --quiet; then
    echo "未检测到更改。退出。"
    exit 0
fi

echo "正在暂存 Git 更改..."
git add .

# 步骤 6: 使用动态消息提交更改
commit_message="更新博客内容 - $(date +'%Y-%m-%d %H:%M:%S')"
if git diff --cached --quiet; then
    echo "没有更改需要提交。"
    exit 0
fi

echo "正在提交更改..."
git commit -m "$commit_message"

# 步骤 7: 推送更改到主分支
echo "正在推送到 GitHub..."
if ! git push origin main; then
    echo "推送到主分支失败。"
    exit 1
fi

echo "全部完成！内容已同步、构建、提交并部署。"