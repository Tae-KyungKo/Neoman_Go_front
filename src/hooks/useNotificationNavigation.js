import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { normalizeApiError } from '../api/client'
import { getPost } from '../api/postApi'
import { getTeam } from '../api/teamApi'

function extractData(response) {
  return response?.data?.data ?? response?.data ?? null
}

function getUnsupportedMessage(notification) {
  if (notification?.targetType === 'TEAM_APPLICATION') {
    return '팀 가입 신청 알림은 팀 상세 화면에서 확인해주세요.'
  }

  return '이 알림은 아직 바로 이동을 지원하지 않습니다.'
}

function getMissingTargetMessage(targetType) {
  return `${targetType ?? 'UNKNOWN'} 알림의 targetId를 확인할 수 없습니다.`
}

export function useNotificationNavigation() {
  const navigate = useNavigate()

  const navigateToNotificationTarget = useCallback(
    async function navigateToNotificationTarget(notification) {
      const targetType = notification?.targetType
      const targetId = notification?.targetId

      if (targetType !== 'TEAM' && targetType !== 'POST') {
        return {
          success: false,
          message: getUnsupportedMessage(notification),
        }
      }

      if (!targetId) {
        return {
          success: false,
          message: getMissingTargetMessage(targetType),
        }
      }

      try {
        if (targetType === 'TEAM') {
          const response = await getTeam(targetId)
          const team = extractData(response)

          if (!team?.category) {
            return {
              success: false,
              message: '팀 카테고리를 확인할 수 없어 상세 화면으로 이동할 수 없습니다.',
            }
          }

          navigate(`/c/${team.category}/teams/${targetId}`)
          return { success: true }
        }

        const response = await getPost(targetId)
        const post = extractData(response)

        if (!post?.category) {
          return {
            success: false,
            message: '게시글 카테고리를 확인할 수 없어 상세 화면으로 이동할 수 없습니다.',
          }
        }

        navigate(`/c/${post.category}/posts/${targetId}`)
        return { success: true }
      } catch (error) {
        const normalizedError = normalizeApiError(error)

        return {
          success: false,
          message:
            normalizedError.message ??
            '알림 대상 리소스를 찾을 수 없습니다.',
        }
      }
    },
    [navigate],
  )

  return { navigateToNotificationTarget }
}
