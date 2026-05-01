import { Hono } from 'hono';
import { runIntelligenceAgent } from './agents/intelligence.js';
import { runReasoningAgent } from './agents/reasoning.js';

const app = new Hono();

// HTTP 触发端点：处理跨设备的实时推理请求 (例如从 Termux 或手机端发来的理科题)
app.post('/api/reasoning', async (c) => {
  const body = await c.req.json();
  const { question, subject } = body;
  
  if (!question) return c.json({ error: "Missing question" }, 400);

  const apiKey = c.env.GEMINI_API_KEY;
  const result = await runReasoningAgent(question, subject, apiKey);
  
  return c.json({ success: true, data: result });
});

// 默认健康检查
app.get('/', (c) => c.text('OpenClaw Multi-Agent System is running!'));

export default {
  fetch: app.fetch,
  
  // Scheduled 事件处理：每周五下午 4 点自动触发
  async scheduled(event, env, ctx) {
    console.log(`[Cron Triggered] Executing weekly tasks at ${event.cron}`);
    // 异步执行情报感知 Agent，生成本周 AI 简报
    ctx.waitUntil(runIntelligenceAgent(env.GEMINI_API_KEY));
  }
};
