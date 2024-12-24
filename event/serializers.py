from rest_framework import serializers
from .models import Event, Shift, Queue, QueuePage
from support.serializers import SupportTypeSerializer

class QueuePageSerializer(serializers.ModelSerializer):
    class Meta:
        model = QueuePage
        fields = '__all__'
class QueueSerializer(serializers.ModelSerializer):
    pages = QueuePageSerializer(many=True, read_only=True, source='queuepage_set')
    class Meta:
        model = Queue
        fields = '__all__'

class ShiftSerializer(serializers.ModelSerializer):
    queues = QueueSerializer(many=True, read_only=True, source='queue_set')
    class Meta:
        model = Shift
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    support_type = SupportTypeSerializer(read_only=True)
    distribution_days = serializers.SerializerMethodField()
    event_days = serializers.SerializerMethodField(read_only=True)

    def get_event_days(self, obj):
        return obj.event_days

    def get_distribution_days(self, obj):
        shifts = Shift.objects.filter(event=obj)
        grouped_shifts = {}

        for shift in shifts:
            day = shift.start_time.date().isoformat()
            shift_key = (shift.start_time.time().strftime('%H:%M'), shift.end_time.time().strftime('%H:%M'))
            shift_data = {
                'start': shift_key[0],
                'end': shift_key[1],
                'queues': [
                    {
                        'doktors': [str(doktor.id) for doktor in queue.doktors.all()],
                        'queue_pages': [
                            {
                                'page_number': page.page_number,
                                'families': [str(family.title) for family in page.families.all()]
                            } for page in queue.queuepage_set.all()
                        ]
                    } for queue in shift.queue_set.all()
                ],
                'doktors': [str(doktor.id) for doktor in shift.doktors.all()]
            }

            if day not in grouped_shifts:
                grouped_shifts[day] = {}
            if shift_key not in grouped_shifts[day]:
                grouped_shifts[day][shift_key] = shift_data

        distribution_days = []
        for day, shifts in grouped_shifts.items():
            distribution_days.append({
                'day': day,
                'shifts': list(shifts.values())
            })

        return distribution_days

    class Meta:
        model = Event
        fields = '__all__'