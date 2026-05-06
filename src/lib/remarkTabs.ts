/**
 * remark-directive 컨테이너 `:::tabs ... :::` 를 `<div class="tabs-directive">` 로 변환.
 * MarkdownViewer 의 components prop 에서 `div` 인터셉터가 className 을 보고
 * Tabs 컴포넌트로 라우팅함.
 *
 * (참고: hName 으로 커스텀 엘리먼트 (예: <tab-group>) 를 시도하면 children 이
 * 드롭됨 — mdast-util-to-hast 의 unknownHandler 가 알려진 HTML 태그명일 때만
 * 자식을 재귀 처리하기 때문. 그래서 div + className 우회.)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Node = any;

function walk(node: Node, fn: (n: Node) => void): void {
    if (!node || typeof node !== 'object') return;
    fn(node);
    if (Array.isArray(node.children)) {
        for (const child of node.children) {
            walk(child, fn);
        }
    }
}

export function remarkTabs() {
    return (tree: Node) => {
        walk(tree, (node) => {
            if (
                (node.type === 'containerDirective' || node.type === 'leafDirective') &&
                node.name === 'tabs'
            ) {
                node.data = node.data || {};
                node.data.hName = 'div';
                node.data.hProperties = { className: 'tabs-directive' };
            }
        });
    };
}
